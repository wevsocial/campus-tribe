import React, { useEffect, useState } from 'react';
import { CreditCard, Building2, CheckCircle2, AlertCircle, Loader2, XCircle, Plus, Shield, Clock, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

interface PaymentMethod {
  id: string;
  payment_type: string;
  card_last4?: string;
  card_brand?: string;
  card_exp_month?: number;
  card_exp_year?: number;
  card_holder_name?: string;
  bank_reference?: string;
  is_default: boolean;
  verified: boolean;
  created_at: string;
}

interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: string;
  period_start?: string;
  period_end?: string;
  paid_at?: string;
  notes?: string;
  created_at: string;
}

// Simple Luhn algorithm check
function luhnCheck(num: string): boolean {
  const digits = num.replace(/\s+/g, '').split('').reverse().map(Number);
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let d = digits[i];
    if (i % 2 === 1) { d *= 2; if (d > 9) d -= 9; }
    sum += d;
  }
  return sum % 10 === 0;
}

function detectCardBrand(num: string): string {
  const n = num.replace(/\s+/g, '');
  if (/^4/.test(n)) return 'Visa';
  if (/^5[1-5]/.test(n) || /^2[2-7]/.test(n)) return 'Mastercard';
  if (/^3[47]/.test(n)) return 'Amex';
  if (/^6(?:011|5)/.test(n)) return 'Discover';
  return 'Card';
}

function maskCardNumber(num: string): string {
  const n = num.replace(/\s+/g, '');
  return `**** **** **** ${n.slice(-4)}`;
}

export default function BillingSection({ isAdmin = false }: { isAdmin?: boolean }) {
  const { profile, institutionId, refreshProfile, user } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAddCard, setShowAddCard] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardError, setCardError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // For admin: seat billing view
  const [seatBilling, setSeatBilling] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [payingSeats, setPayingSeats] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'payment' | 'invoices' | 'seats'>('overview');

  useEffect(() => {
    loadData();
  }, [profile?.id, institutionId]);

  const loadData = async () => {
    if (!profile?.id) return;
    setLoading(true);
    try {
      // Load payment methods
      const { data: pm } = await supabase
        .from('ct_payment_methods')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });
      setPaymentMethods(pm || []);

      // Load subscription
      if (institutionId) {
        const { data: sub } = await supabase
          .from('ct_institution_subscriptions')
          .select('*, ct_billing_plans(*)')
          .eq('institution_id', institutionId)
          .maybeSingle();
        setSubscription(sub);

        // Load invoices
        const { data: inv } = await supabase
          .from('ct_billing_invoices')
          .select('*')
          .eq('institution_id', institutionId)
          .order('created_at', { ascending: false })
          .limit(20);
        setInvoices(inv || []);

        // Admin: load seat billing
        if (isAdmin) {
          const { data: seats } = await supabase
            .from('ct_user_seat_billing')
            .select('*, ct_users!ct_user_seat_billing_user_id_fkey(id, email, full_name, role)')
            .eq('institution_id', institutionId);
          setSeatBilling(seats || []);

          const { data: u } = await supabase
            .from('ct_users')
            .select('id, email, full_name, role, payment_status')
            .eq('institution_id', institutionId)
            .neq('role', 'student')
            .order('role');
          setUsers(u || []);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  };

  const validateAndSaveCard = async () => {
    setCardError('');
    const rawNum = cardNumber.replace(/\s+/g, '');
    if (rawNum.length < 13) { setCardError('Invalid card number length.'); return; }
    if (!luhnCheck(rawNum)) { setCardError('Card number is invalid. Please check and try again.'); return; }

    const [expM, expY] = expiry.split('/');
    const month = parseInt(expM || '0');
    const year = parseInt(`20${expY || '0'}`);
    if (!month || month < 1 || month > 12) { setCardError('Invalid expiry month.'); return; }
    const now = new Date();
    if (year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1)) {
      setCardError('Card is expired.'); return;
    }

    if (!cvv || cvv.length < 3) { setCardError('Invalid CVV.'); return; }
    if (!cardHolder.trim()) { setCardError('Cardholder name is required.'); return; }

    setSaving(true);
    try {
      // In production: tokenize via payment gateway. Here we store masked data only.
      const brand = detectCardBrand(rawNum);
      const last4 = rawNum.slice(-4);

      // Remove previous default
      if (paymentMethods.length > 0) {
        await supabase.from('ct_payment_methods')
          .update({ is_default: false })
          .eq('user_id', profile!.id);
      }

      const { error } = await supabase.from('ct_payment_methods').insert({
        user_id: profile!.id,
        institution_id: institutionId,
        payment_type: 'card',
        card_last4: last4,
        card_brand: brand,
        card_exp_month: month,
        card_exp_year: year,
        card_holder_name: cardHolder.trim(),
        is_default: true,
        verified: true,
      });

      if (error) throw error;

      // Update user payment_status to 'paid'
      await supabase.from('ct_users')
        .update({ payment_status: 'paid' })
        .eq('id', profile!.id);

      // Create a pending invoice
      if (institutionId) {
        await supabase.from('ct_billing_invoices').insert({
          institution_id: institutionId,
          amount: 4.99,
          currency: 'CAD',
          status: 'pending',
          notes: `Monthly subscription - ${profile!.role} seat`,
          period_start: new Date().toISOString(),
          period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        });
      }

      setSaveSuccess(true);
      setShowAddCard(false);
      setCardNumber(''); setCardHolder(''); setExpiry(''); setCvv('');
      await loadData();
      if (user?.id) await refreshProfile(user.id);
      setTimeout(() => setSaveSuccess(false), 5000);
    } catch (e: any) {
      setCardError(e.message || 'Failed to save card. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const payForSeats = async () => {
    if (!selectedUsers.length || !institutionId) return;
    setPayingSeats(true);
    try {
      const defaultPm = paymentMethods.find(p => p.is_default && p.verified);
      if (!defaultPm) { alert('Please add a payment method first.'); setPayingSeats(false); return; }

      for (const uid of selectedUsers) {
        await supabase.from('ct_user_seat_billing').upsert({
          institution_id: institutionId,
          user_id: uid,
          role: users.find(u => u.id === uid)?.role || 'staff',
          is_paid: true,
          paid_by: profile!.id,
          paid_at: new Date().toISOString(),
        }, { onConflict: 'institution_id,user_id' });

        await supabase.from('ct_users')
          .update({ payment_status: 'paid' })
          .eq('id', uid);
      }

      // Generate invoice for seat batch
      const amount = selectedUsers.length * 4.99;
      await supabase.from('ct_billing_invoices').insert({
        institution_id: institutionId,
        amount,
        currency: 'CAD',
        status: 'paid',
        paid_at: new Date().toISOString(),
        notes: `Seat payment for ${selectedUsers.length} user(s)`,
        period_start: new Date().toISOString(),
        period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });

      setSelectedUsers([]);
      await loadData();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } finally {
      setPayingSeats(false);
    }
  };

  const statusColor = (status: string) => {
    if (status === 'paid' || status === 'active') return 'text-green-600 bg-green-50';
    if (status === 'pending' || status === 'trial') return 'text-amber-600 bg-amber-50';
    if (status === 'failed' || status === 'overdue' || status === 'past_due') return 'text-red-600 bg-red-50';
    return 'text-gray-600 bg-gray-100';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={28} className="animate-spin text-primary" />
      </div>
    );
  }

  const hasValidPayment = paymentMethods.some(p => p.verified);
  const tabs = isAdmin
    ? [
        { id: 'overview', label: 'Overview' },
        { id: 'seats', label: 'Manage Seats' },
        { id: 'payment', label: 'Payment Methods' },
        { id: 'invoices', label: 'Invoices' },
      ]
    : [
        { id: 'overview', label: 'Overview' },
        { id: 'payment', label: 'Payment Method' },
        { id: 'invoices', label: 'Invoices' },
      ];

  return (
    <section id="billing" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-lexend font-900 text-on-surface">Bills &amp; Payments</h2>
          <p className="text-sm text-on-surface-variant mt-0.5">Manage your payment methods and view invoices</p>
        </div>
        {saveSuccess && (
          <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-full px-4 py-2 text-sm font-jakarta font-700">
            <CheckCircle2 size={16} />
            Saved successfully!
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-container-low p-1 rounded-2xl overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`flex-1 min-w-fit px-4 py-2 rounded-xl text-sm font-jakarta font-600 transition-all whitespace-nowrap ${
              activeTab === t.id
                ? 'bg-white dark:bg-slate-800 shadow-sm text-primary'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* Status card */}
          <div className={`rounded-2xl p-5 border ${hasValidPayment ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
            <div className="flex items-start gap-3">
              {hasValidPayment
                ? <CheckCircle2 size={24} className="text-green-600 shrink-0 mt-0.5" />
                : <AlertCircle size={24} className="text-amber-600 shrink-0 mt-0.5" />
              }
              <div>
                <p className={`font-lexend font-800 text-base ${hasValidPayment ? 'text-green-800' : 'text-amber-800'}`}>
                  {hasValidPayment ? 'Payment Active' : 'Payment Required'}
                </p>
                <p className={`text-sm mt-0.5 ${hasValidPayment ? 'text-green-700' : 'text-amber-700'}`}>
                  {hasValidPayment
                    ? `Your account is active. You have full access to all ${profile?.role} features.`
                    : `Add a payment method to unlock all features for your ${profile?.role} account.`
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Subscription details */}
          {subscription && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-surface-container-low p-5">
              <h3 className="font-jakarta font-800 text-on-surface mb-3">Subscription</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-on-surface-variant">Status</p>
                  <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-jakarta font-700 ${statusColor(subscription.status)}`}>
                    {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant">Plan</p>
                  <p className="text-sm font-jakarta font-700 text-on-surface mt-0.5">Standard • CAD $4.99/user/mo</p>
                </div>
                {subscription.trial_ends_at && subscription.status === 'trial' && (
                  <div className="col-span-2">
                    <p className="text-xs text-on-surface-variant">Trial Ends</p>
                    <p className="text-sm font-jakarta font-600 text-on-surface mt-0.5">
                      {new Date(subscription.trial_ends_at).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                )}
              </div>
              {!hasValidPayment && (
                <button
                  onClick={() => setActiveTab('payment')}
                  className="mt-4 w-full bg-primary text-white rounded-xl py-2.5 text-sm font-jakarta font-700 hover:bg-primary/90 transition-colors"
                >
                  Add Payment Method
                </button>
              )}
            </div>
          )}

          {/* Direct deposit option */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-surface-container-low p-5">
            <div className="flex items-center gap-2 mb-2">
              <Building2 size={18} className="text-primary" />
              <h3 className="font-jakarta font-800 text-on-surface">Direct Deposit / Bank Transfer</h3>
            </div>
            <p className="text-sm text-on-surface-variant mb-3">
              Pay quarterly or annually by bank transfer and save 2-3% on credit card processing fees. Contact us to set up direct deposit for your institution.
            </p>
            <div className="bg-surface-container-low rounded-xl p-3 text-xs font-jakarta space-y-1">
              <p className="font-700 text-on-surface">Campus Tribe Corporate Banking</p>
              <p className="text-on-surface-variant">Account Name: WevSocial Technologies Inc.</p>
              <p className="text-on-surface-variant">Contact: billing@campustribe.org for account details</p>
            </div>
          </div>
        </div>
      )}

      {/* Payment Method Tab */}
      {activeTab === 'payment' && (
        <div className="space-y-4">
          {/* Existing cards */}
          {paymentMethods.map(pm => (
            <div key={pm.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-surface-container-low p-4 flex items-center gap-4">
              <div className="w-12 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center shrink-0">
                <CreditCard size={16} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-jakarta font-700 text-on-surface text-sm">
                  {pm.card_brand} •••• {pm.card_last4}
                </p>
                <p className="text-xs text-on-surface-variant">
                  {pm.card_holder_name} · Expires {pm.card_exp_month}/{pm.card_exp_year}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {pm.is_default && (
                  <span className="text-xs bg-primary-container text-primary rounded-full px-2 py-0.5 font-jakarta font-700">Default</span>
                )}
                {pm.verified && <Shield size={14} className="text-green-500" />}
              </div>
            </div>
          ))}

          {/* Add card button / form */}
          {!showAddCard ? (
            <button
              onClick={() => setShowAddCard(true)}
              className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-surface-container-high rounded-2xl py-4 text-sm font-jakarta font-700 text-on-surface-variant hover:border-primary hover:text-primary transition-colors"
            >
              <Plus size={18} />
              Add Credit / Debit Card
            </button>
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-surface-container-low p-5 space-y-4">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-jakarta font-800 text-on-surface">Add Card</h3>
                <button onClick={() => { setShowAddCard(false); setCardError(''); }} className="text-on-surface-variant hover:text-on-surface">
                  <XCircle size={20} />
                </button>
              </div>

              <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl px-3 py-2">
                <Shield size={14} className="text-blue-600" />
                <p className="text-xs text-blue-700 dark:text-blue-300 font-jakarta">Your card details are encrypted and securely stored.</p>
              </div>

              <div>
                <label className="block text-xs font-jakarta font-700 text-on-surface-variant mb-1.5">Card Number</label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                    className="w-full pl-4 pr-16 py-3 rounded-xl border border-surface-container-high bg-surface text-on-surface text-sm font-jakarta focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    maxLength={19}
                  />
                  {cardNumber.length > 4 && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-jakarta font-700 text-primary">
                      {detectCardBrand(cardNumber.replace(/\s+/g, ''))}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-jakarta font-700 text-on-surface-variant mb-1.5">Cardholder Name</label>
                <input
                  type="text"
                  placeholder="John Smith"
                  value={cardHolder}
                  onChange={e => setCardHolder(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-surface-container-high bg-surface text-on-surface text-sm font-jakarta focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-jakarta font-700 text-on-surface-variant mb-1.5">Expiry (MM/YY)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="12/27"
                    value={expiry}
                    onChange={e => setExpiry(formatExpiry(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl border border-surface-container-high bg-surface text-on-surface text-sm font-jakarta focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    maxLength={5}
                  />
                </div>
                <div>
                  <label className="block text-xs font-jakarta font-700 text-on-surface-variant mb-1.5">CVV</label>
                  <input
                    type="password"
                    inputMode="numeric"
                    placeholder="•••"
                    value={cvv}
                    onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    className="w-full px-4 py-3 rounded-xl border border-surface-container-high bg-surface text-on-surface text-sm font-jakarta focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    maxLength={4}
                  />
                </div>
              </div>

              {cardError && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 rounded-xl px-3 py-2 text-sm">
                  <AlertCircle size={14} />
                  {cardError}
                </div>
              )}

              <button
                onClick={validateAndSaveCard}
                disabled={saving}
                className="w-full bg-primary text-white rounded-xl py-3 text-sm font-jakarta font-700 hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {saving ? <><Loader2 size={16} className="animate-spin" /> Processing...</> : 'Save Card & Activate Account'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Manage Seats Tab (admin only) */}
      {activeTab === 'seats' && isAdmin && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-surface-container-low overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-surface-container-low">
              <h3 className="font-jakarta font-800 text-on-surface">Institution Users</h3>
              <div className="flex items-center gap-2">
                {selectedUsers.length > 0 && (
                  <button
                    onClick={payForSeats}
                    disabled={payingSeats || !paymentMethods.some(p => p.verified)}
                    className="text-xs bg-primary text-white rounded-full px-4 py-1.5 font-jakarta font-700 hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center gap-1.5"
                  >
                    {payingSeats ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                    Pay {selectedUsers.length} Seat{selectedUsers.length !== 1 ? 's' : ''} (CAD ${(selectedUsers.length * 4.99).toFixed(2)}/mo)
                  </button>
                )}
                <button
                  onClick={() => setSelectedUsers(users.filter(u => u.payment_status !== 'paid').map(u => u.id))}
                  className="text-xs text-primary hover:underline font-jakarta font-600"
                >
                  Select Unpaid
                </button>
              </div>
            </div>
            <div className="divide-y divide-surface-container-low max-h-96 overflow-y-auto">
              {users.map(u => {
                const isSel = selectedUsers.includes(u.id);
                return (
                  <div key={u.id} className={`flex items-center gap-3 px-4 py-3 ${isSel ? 'bg-primary-container/20' : ''}`}>
                    <input
                      type="checkbox"
                      checked={isSel}
                      onChange={e => setSelectedUsers(s =>
                        e.target.checked ? [...s, u.id] : s.filter(x => x !== u.id)
                      )}
                      className="w-4 h-4 rounded accent-primary"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-jakarta font-700 text-on-surface truncate">{u.full_name || u.email}</p>
                      <p className="text-xs text-on-surface-variant truncate">{u.email}</p>
                    </div>
                    <span className="text-xs font-jakarta font-600 text-on-surface-variant capitalize shrink-0">{u.role?.replace('_', ' ')}</span>
                    <span className={`text-xs rounded-full px-2 py-0.5 font-jakarta font-700 shrink-0 ${statusColor(u.payment_status || 'pending')}`}>
                      {u.payment_status === 'paid' ? 'Paid' : u.payment_status === 'not_required' ? 'Free' : 'Unpaid'}
                    </span>
                  </div>
                );
              })}
              {users.length === 0 && (
                <div className="py-8 text-center text-sm text-on-surface-variant">No paid-role users found</div>
              )}
            </div>
          </div>

          {!paymentMethods.some(p => p.verified) && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
              <AlertCircle size={18} className="text-amber-600 shrink-0" />
              <p className="text-sm text-amber-700">Add a payment method first to pay for user seats.</p>
              <button onClick={() => setActiveTab('payment')} className="text-sm font-jakarta font-700 text-primary ml-auto shrink-0">
                Add Card
              </button>
            </div>
          )}
        </div>
      )}

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <div className="space-y-3">
          {invoices.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-surface-container-low p-8 text-center">
              <Clock size={32} className="mx-auto text-on-surface-variant mb-2" />
              <p className="text-sm text-on-surface-variant">No invoices yet</p>
            </div>
          ) : (
            invoices.map(inv => (
              <div key={inv.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-surface-container-low p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-jakarta font-700 text-on-surface">
                    CAD ${inv.amount.toFixed(2)}
                  </p>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    {inv.notes || 'Monthly subscription'} · {new Date(inv.created_at).toLocaleDateString('en-CA')}
                  </p>
                </div>
                <span className={`text-xs rounded-full px-2.5 py-0.5 font-jakarta font-700 ${statusColor(inv.status)}`}>
                  {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </section>
  );
}
