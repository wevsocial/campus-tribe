import React, { useState } from 'react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import { CreditCard } from 'lucide-react';

interface BudgetItem { id: string; description: string; amount: number; type: 'income' | 'expense'; date: string; }

export default function ClubLeaderBudget() {
  const [items, setItems] = useState<BudgetItem[]>([
    { id: '1', description: 'Institutional Grant', amount: 500, type: 'income', date: '2025-01-01' },
    { id: '2', description: 'Event Supplies', amount: -120, type: 'expense', date: '2025-01-15' },
  ]);
  const [duesEnabled, setDuesEnabled] = useState(false);
  const [duesAmount, setDuesAmount] = useState('25');

  const [form, setForm] = useState({ description: '', amount: '', type: 'expense' as 'income' | 'expense' });

  const addItem = () => {
    if (!form.description.trim() || !form.amount) return;
    const sign = form.type === 'expense' ? -1 : 1;
    setItems([...items, { id: Date.now().toString(), description: form.description, amount: sign * Math.abs(+form.amount), type: form.type, date: new Date().toISOString().split('T')[0] }]);
    setForm({ description: '', amount: '', type: 'expense' });
  };

  const balance = items.reduce((sum, i) => sum + i.amount, 0);
  const income = items.filter(i => i.type === 'income').reduce((s, i) => s + i.amount, 0);
  const expenses = items.filter(i => i.type === 'expense').reduce((s, i) => s + Math.abs(i.amount), 0);

  return (
    <div className="space-y-6">
      <h1 className="font-lexend text-2xl font-extrabold text-on-surface">Budget</h1>
      <div className="grid grid-cols-3 gap-4">
        <Card variant="primary-tinted"><p className="font-lexend font-bold text-2xl text-primary">${balance.toFixed(2)}</p><p className="text-xs text-on-surface-variant mt-1">Balance</p></Card>
        <Card variant="tertiary-tinted"><p className="font-lexend font-bold text-2xl text-tertiary">${income.toFixed(2)}</p><p className="text-xs text-on-surface-variant mt-1">Income</p></Card>
        <Card><p className="font-lexend font-bold text-2xl text-red-500">${expenses.toFixed(2)}</p><p className="text-xs text-on-surface-variant mt-1">Expenses</p></Card>
      </div>
      <Card>
        <h2 className="font-lexend font-bold text-on-surface mb-3">Add Entry</h2>
        <div className="flex gap-3">
          <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description"
            className="flex-1 px-4 py-2.5 rounded-xl bg-surface-low border border-outline-variant/50 font-jakarta text-sm focus:outline-none" />
          <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="Amount"
            className="w-24 px-4 py-2.5 rounded-xl bg-surface-low border border-outline-variant/50 font-jakarta text-sm focus:outline-none" />
          <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value as 'income' | 'expense' })}
            className="px-4 py-2.5 rounded-xl bg-surface-low border border-outline-variant/50 font-jakarta text-sm focus:outline-none">
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
          <Button onClick={addItem} className="rounded-full">Add</Button>
        </div>
      </Card>
      <div className="space-y-2">
        {items.map(item => (
          <Card key={item.id} className="flex items-center justify-between">
            <div>
              <p className="font-jakarta font-bold text-on-surface text-sm">{item.description}</p>
              <p className="text-xs text-on-surface-variant">{item.date}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge label={item.type} variant={item.type === 'income' ? 'success' : 'danger'} />
              <span className={`font-lexend font-bold ${item.type === 'income' ? 'text-tertiary' : 'text-red-500'}`}>
                {item.type === 'income' ? '+' : '-'}${Math.abs(item.amount).toFixed(2)}
              </span>
            </div>
          </Card>
        ))}
      </div>

      {/* Club dues payment toggle — Module 16 */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <CreditCard size={18} className="text-primary" />
          <h2 className="font-lexend font-bold text-on-surface">Club Dues Collection</h2>
        </div>
        <div className="flex items-center justify-between py-2 mb-3">
          <div>
            <p className="font-jakarta font-700 text-on-surface text-sm">Enable dues collection</p>
            <p className="text-xs text-on-surface-variant">Collect membership dues via Helcim payment</p>
          </div>
          <button
            onClick={() => setDuesEnabled(!duesEnabled)}
            className={`relative w-12 h-6 rounded-full transition-colors ${duesEnabled ? 'bg-primary' : 'bg-gray-300 dark:bg-slate-600'}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${duesEnabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
          </button>
        </div>
        {duesEnabled && (
          <div className="space-y-2">
            <label className="font-jakarta text-sm font-700 text-on-surface-variant block">Annual dues amount ($)</label>
            <input type="number" value={duesAmount} onChange={e => setDuesAmount(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-surface-low border border-outline-variant/50 font-jakarta text-sm text-on-surface focus:outline-none" min={0} />
            <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800">
              <span className="text-green-500">✓</span>
              <p className="text-xs font-jakarta text-green-700 dark:text-green-400">Dues collection active: ${duesAmount}/year per member</p>
            </div>
          </div>
        )}
        {!duesEnabled && (
          <p className="text-xs text-on-surface-variant font-jakarta">No dues currently being collected. Enable to start collecting membership fees.</p>
        )}
      </Card>
    </div>
  );
}
