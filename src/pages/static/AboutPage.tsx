import PublicNav from '../../components/layout/PublicNav';
import PublicFooter from '../../components/layout/PublicFooter';

export default function AboutPage() {
  const team = [
    { name: 'Marcus Thorne', role: 'CEO and Co-Founder', img: 'https://lh3.googleusercontent.com/aida/ADBb0uhrr7bDOWviquATfr048NaXZhF129tR_Mucus-4UyTXK-C9axen5j1pB_vqO4fy_i0RIkK0H3bpykLteSKWbHz3S4BbdO7JxLsHKTsurI-9EGV6zMuD0Uc-B593bTPykXD_a6Kp8p3JRzdn7kym-GJaVqgWuDvtg53quMNOOtE47oFA4r1DVqDSHzd0Um3gonOT8ry_94GLPEVaOH5qWZQqi1hn8P5tqzJMLAlknmAur5okqV2CONw6I5Ynt_-Kbs2yoaFVNHBI3g' },
    { name: 'Sarah Chen', role: 'CTO', img: 'https://lh3.googleusercontent.com/aida/ADBb0ujouEImxloeNrHZfAzEXB-bBfUpvwGDGPSlf6-c8zLJpnnQ45HPS6bACEOHUHJX2AxnZMfgINrBHniaFuWGHZhL0dpvJJjAic9ddMqNMIQ8hT_f88QKDTDyngQ1HmBHc0nujF8z9sNSTtZA2DzK_zTseFkH9PXtOungmvyEqRWsvbkH1k9Kzrw15x3NQ0n-VYJnLkzpprJpzoHQIsaesm2Rp50ZDXOFVnpXc5-PF3CyMs6U8goZ_VazvjEcOVHN2-Y2HKwEnAzg' },
    { name: 'Elias Vance', role: 'VP Product', img: 'https://lh3.googleusercontent.com/aida/ADBb0ugEdqwJOI_PI9OUpGkYBNVUQvxP4vOJVJ4JvQCyiOPOZ1hfr4D1iVz0xb32f-GrBzg1iZ_FbHd_5cbnBxhr1HEiep8uuUQJZJPnuNC2yaEPrrkhP7--C40tS5EI4YIMgHr-U0N7TH4vFYMEp-hdRSHo9qljrTUnQ8iyqT15V0PJnzUaxO2rhb8BV45vtnPBzyHiLq0luRx-A53-SWsVM1PIa7USDn3eoRkpd_aQR4M698o2kBOklqKvF8G_4N_5CiFcqlM_JfOi' },
  ];

  return (
    <div className="bg-background dark:bg-slate-950 min-h-screen">
      <PublicNav />
      <main className="pt-28">
        {/* Hero */}
        <section className="max-w-7xl mx-auto px-8 py-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container text-secondary text-xs font-label uppercase tracking-widest font-bold mb-6">
            Our Story
          </div>
          <h1 className="font-headline font-extrabold text-5xl lg:text-7xl text-on-surface dark:text-slate-50 tracking-tight mb-6">
            Built for <span className="text-primary">Students</span>,<br />by People Who Care.
          </h1>
          <p className="text-xl text-on-surface-variant dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Campus Tribe is a product of WevSocial Inc. - a social technology company on a mission to create meaningful human connections at scale.
          </p>
        </section>

        {/* Mission */}
        <section className="bg-surface-container-low dark:bg-slate-900 py-20">
          <div className="max-w-7xl mx-auto px-8 grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-headline font-bold text-4xl text-on-surface dark:text-slate-100 mb-6">Our Mission</h2>
              <p className="text-on-surface-variant dark:text-slate-400 text-lg leading-relaxed mb-6">
                We believe every student deserves to feel connected - to their peers, their institution, and their potential. Too many students drift through education feeling invisible.
              </p>
              <p className="text-on-surface-variant dark:text-slate-400 text-lg leading-relaxed mb-8">
                Campus Tribe exists to change that. We are building the infrastructure for belonging - an AI-powered, privacy-first engagement platform that brings campus life together in one unified experience.
              </p>
              <div className="grid grid-cols-3 gap-6 text-center">
                {[['200+', 'Institutions'], ['500K+', 'Students'], ['92%', 'Satisfaction']].map(([stat, label]) => (
                  <div key={label} className="bg-surface-container-lowest dark:bg-slate-800 p-6 rounded-xl shadow-sm">
                    <div className="font-headline font-black text-3xl text-primary">{stat}</div>
                    <div className="text-sm text-on-surface-variant dark:text-slate-400 font-medium mt-1">{label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl">
              <img
                alt="Team at work"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida/ADBb0ugkCiCZWYSPnnZEFM1gYWFmwkBZmUvcaNALjwsRwr-Cp-T9eJ0WcGkwB_17qe1DTbPL8299vJvsVsOwRDcoE151lGbt0ZubIvn8gWcH1wwVQcptOAgbzX6c4mnfHQA8Y_VFNQPocKxZjAm9HNz0Pt2qOZxSm0WPdYnkFMaSnmv3wncofZLcy5zH50tFCXdvWH-f8F74PlcDyfSsOO9WiiXxCAxc2xV933AVumwLQPmdVNFG9VCaw8JTm77Tr6Ho-Zs8Ng1V0xoC"
              />
            </div>
          </div>
        </section>

        {/* WevSocial */}
        <section className="max-w-7xl mx-auto px-8 py-20">
          <div className="bg-primary text-white rounded-3xl p-12 text-center">
            <h2 className="font-headline font-bold text-3xl mb-4">Powered by WevSocial</h2>
            <p className="text-primary-container max-w-2xl mx-auto leading-relaxed">
              WevSocial is the parent company behind Campus Tribe. Founded in 2020, WevSocial creates social connectivity platforms for communities worldwide - from students to professionals to neighborhoods. Our technology stack powers millions of meaningful connections every day.
            </p>
          </div>
        </section>

        {/* Team */}
        <section className="bg-surface-container-low dark:bg-slate-900 py-20">
          <div className="max-w-7xl mx-auto px-8">
            <h2 className="font-headline font-bold text-4xl text-on-surface dark:text-slate-100 text-center mb-12">Leadership Team</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {team.map(member => (
                <div key={member.name} className="bg-surface-container-lowest dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all">
                  <img src={member.img} alt={member.name} className="w-full h-56 object-cover" />
                  <div className="p-6">
                    <h3 className="font-headline font-bold text-xl dark:text-slate-100">{member.name}</h3>
                    <p className="text-secondary font-medium text-sm mt-1">{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
