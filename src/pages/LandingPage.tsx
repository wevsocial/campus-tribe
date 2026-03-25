import { Link } from 'react-router-dom';
import PublicNav from '../components/layout/PublicNav';
import PublicFooter from '../components/layout/PublicFooter';

export default function LandingPage() {
  const pillars = [
    { title: 'Smart Matching', icon: 'psychology', img: 'https://lh3.googleusercontent.com/aida/ADBb0ugkCiCZWYSPnnZEFM1gYWFmwkBZmUvcaNALjwsRwr-Cp-T9eJ0WcGkwB_17qe1DTbPL8299vJvsVsOwRDcoE151lGbt0ZubIvn8gWcH1wwVQcptOAgbzX6c4mnfHQA8Y_VFNQPocKxZjAm9HNz0Pt2qOZxSm0WPdYnkFMaSnmv3wncofZLcy5zH50tFCXdvWH-f8F74PlcDyfSsOO9WiiXxCAxc2xV933AVumwLQPmdVNFG9VCaw8JTm77Tr6Ho-Zs8Ng1V0xoC' },
    { title: 'Event Hub', icon: 'event', img: 'https://lh3.googleusercontent.com/aida/ADBb0uiGucTFYsHZ3etUKCy1OTqn2ZhwFxGGDSPAdVrHM3ele0CWSR2Y2qQcEe8prSA46vUapW7yW9r_YJDeKhhgNLbn_XT5bJhfOWP7vzl3NMOUtUkER2NDnn36oEItxl5CzGUtCXQYcB74kv_EUuGiAU64bmD-jTBrHB6JIcacQOokveU9g3gIVl0lrniHWqvQA3bIvDbue3kRiX3ioFmC2XBtKEAdXXhD2oPxusFk6EI2K5XjVWVDqyN7F3DKCRzD1LzLDRMqTEyppA' },
    { title: 'Sports Finder', icon: 'sports_soccer', img: 'https://lh3.googleusercontent.com/aida/ADBb0uhr0Q35iELqZyekQxQECsJTwpvOscodPz9vS8Mz1ZWGSi3JOdDnuCtB227pfSW01yElLhTy7qnRHFKASzA0HBx5NQovHUOBPZ7-z6AomywsI-MptOV7qXVb28siLrD1Ut45mDy9B9ySvtH77FNrFxWnjfqUBmIDLDZKTE9bhTikL1lY_i0FFTJpNXRIbPWvwqvRTTcZjeUs_YRB6Dz5XAj9GW4Doaa-dyL6K1JZRo_wIIdpANmsRu8ge0Ihn13Z5CDBf5deOkrY_Q' },
    { title: 'Venue Booking', icon: 'location_on', img: 'https://lh3.googleusercontent.com/aida/ADBb0ujGlCZS0S4XsnsMvhjxXReEzMZIWsunfnjyWQaPXoRS9Bd6h_feeqfrjUWQUsZTQF5fMxAS7qniWizQnKM8DaqPcEzLkBjWQWQWNt_3mjentJBSPe5sP6qoghMwlDpVZWRNFVoIvxR9xrSM7kzqXvBrvfPE0AsifmZ1h7FQMFZhIBhpjtySZhJj_6j3Xv0oP8sQHRkOAiPLBUwL3izY7_LS4qh1Uy1NDDnKQ9TCOoMJgSdJCEi3PNuJzBTwJ9Ol75pgonpNyS1Kig' },
    { title: 'Wellbeing', icon: 'favorite', img: 'https://lh3.googleusercontent.com/aida/ADBb0ujP1qZxm-k9Xa1FuRQfmLeBrSr3pQEq0hZ5NbLapX5U28HTGLgdHK7y1iQwTlh6LBKgzt26XnwlskiNSVKVkKdx0Gh4FAM0HQk2bayTNU3dvWeRQ7THYg8gGwVyqjlsX5epzWMqwZck8q2SIUFz6NiuOG4U2cpqbE9xJlBzA0ZDyVcryejYHdourICuu9uUU90ijEjZJUtWnq4ia-YdTqw6mwEkKQcHw5pltH0pWOKDqjYNfIkL33fnbS6mKy1nTvL9on8C2Ipn' },
    { title: 'Parent Portal', icon: 'family_restroom', img: 'https://lh3.googleusercontent.com/aida/ADBb0uhG-rkFR2Iv4P9PUSDl_Mla2GuoF3c-LWpKNKpu_cpjZNNmPUP_bgTYuynWOJJKFdzie93ZMf0M2gr8mYrQxPTL94l1Pe4MZU9XiPQ9R8d8ILm7RCAr8zHFwsDbTVLnkQnIk_3XKvPRD-8q9YH6ifLFM6QUKMj9VjMe04o5kRX7VlsuGEWxBtBcSnw0rPr2vqfCuiY0uUoRxzXVnnXGZL4Ow_Edd48rtVg4gTWNnCu9V8AAUXK2ubwIT008ODR-9WSKr8dkOC6bqQ' },
    { title: 'Group Activities', icon: 'groups', img: 'https://lh3.googleusercontent.com/aida/ADBb0uhq7lB27g_tX4vKdwJczHc0sM_pvWBITlAXkZF1FmJx3Wj31bP9EWMQP0TQ6TSJzw0A4E2nwMc59Y6RhfC9ogWanLe96NIMPTcNpk3W26DPfWGpU_ps0uFqBvsdVE8qsmhtxqvOP65nwFXKa_W8xuNHlOMa3NR3eGY6GEpYc9On6dJRqUVswFtLubTyZqAWqp-RKj2J5i36kOaYc6UXgwNh9_4iCzyDl42jqxn7emwz5a6F1k7AVKu9UQRPofIlRN1whGyc2OEipw' },
    { title: 'Surveys & Polls', icon: 'poll', img: 'https://lh3.googleusercontent.com/aida/ADBb0uioNbEJf8Gi-yz3RxTDhGojKaJiLF5RbrTjCSjvMw2LN5Ontlm_4pCldjcr9qBCzGeSOQorydPv05EedZhl9P79uyP-ykhyvPd5h-3wC-tPBu5Xwsy3zhFqz0qxbE5scbiB1kJJTj7x2z4kP6nUDwS4wW_yoTCZSNf5XGiMkMikiZmpHYHh_rIvdG-okWfL7WVv6uKiLpDLz8KbM5RTBIKL1RlZWbvX_dJmZGaQBpDhO43T5HW0_GoK8Hh4tk65XhCXJeRD-8OT' },
  ];
  const roles = [
    { title: 'Students', desc: 'Discover events, clubs, and peers that match your vibe.', img: 'https://lh3.googleusercontent.com/aida/ADBb0ujouEImxloeNrHZfAzEXB-bBfUpvwGDGPSlf6-c8zLJpnnQ45HPS6bACEOHUHJX2AxnZMfgINrBHniaFuWGHZhL0dpvJJjAic9ddMqNMIQ8hT_f88QKDTDyngQ1HmBHc0nujF8z9sNSTtZA2DzK_zTseFkH9PXtOungmvyEqRWsvbkH1k9Kzrw15x3NQ0n-VYJnLkzpprJpzoHQIsaesm2Rp50ZDXOFVnpXc5-PF3CyMs6U8goZ_VazvjEcOVHN2-Y2HKwEnAzg' },
    { title: 'Admins & Teachers', desc: 'Manage events, track wellbeing, and build community.', img: 'https://lh3.googleusercontent.com/aida/ADBb0ugEdqwJOI_PI9OUpGkYBNVUQvxP4vOJVJ4JvQCyiOPOZ1hfr4D1iVz0xb32f-GrBzg1iZ_FbHd_5cbnBxhr1HEiep8uuUQJZJPnuNC2yaEPrrkhP7--C40tS5EI4YIMgHr-U0N7TH4vFYMEp-hdRSHo9qljrTUnQ8iyqT15V0PJnzUaxO2rhb8BV45vtnPBzyHiLq0luRx-A53-SWsVM1PIa7USDn3eoRkpd_aQR4M698o2kBOklqKvF8G_4N_5CiFcqlM_JfOi' },
    { title: 'Coaches', desc: 'Coordinate teams, book venues, and track athlete rankings.', img: 'https://lh3.googleusercontent.com/aida/ADBb0uhrr7bDOWviquATfr048NaXZhF129tR_Mucus-4UyTXK-C9axen5j1pB_vqO4fy_i0RIkK0H3bpykLteSKWbHz3S4BbdO7JxLsHKTsurI-9EGV6zMuD0Uc-B593bTPykXD_a6Kp8p3JRzdn7kym-GJaVqgWuDvtg53quMNOOtE47oFA4r1DVqDSHzd0Um3gonOT8ry_94GLPEVaOH5qWZQqi1hn8P5tqzJMLAlknmAur5okqV2CONw6I5Ynt_-Kbs2yoaFVNHBI3g' },
    { title: 'IT Directors', desc: 'One platform, zero headaches. SSO, APIs, and compliance built in.', img: 'https://lh3.googleusercontent.com/aida/ADBb0ugfgcaP3fkw1ljrjSkPAOPV1tOY-g3kuNw5eb-rRY_TCtYrT7e2qe8zuUipOATo91_PjtFQcWHWDmD-5QVH_AGIslbLWtWfdIs1nP2vRtfMy-vdCEJS-fuB2WjK_ZCXtn8gJ-WezryPHTss1q0IbV6bNK1qC-DAp9gl-DSxGtLdfarDtH7wdWxIWdEg5tgDIASR8AFUkMkAbWV-U_6LvJN9tMf2-8k2qjQdcKebuwUkgB42FG2DwHpUpV4iyeSCqQY-wsEgWmFcBQ' },
  ];
  const pillarsDouble = [...pillars, ...pillars];
  const rolesDouble = [...roles, ...roles];

  return (
    <div className="bg-surface text-on-surface font-body">
      <PublicNav />
      <main className="pt-24 overflow-hidden">
        {/* Hero */}
        <section className="relative max-w-7xl mx-auto px-8 py-16 lg:py-24 grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container text-secondary text-xs font-label uppercase tracking-widest font-bold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
              </span>
              Campus Tribe Connect
            </div>
            <h1 className="font-headline font-extrabold text-5xl lg:text-7xl leading-[1.05] tracking-tight text-on-surface">
              Where Campus <br />
              <span className="text-primary italic">Life Connects</span>
            </h1>
            <p className="text-xl text-on-surface-variant max-w-lg leading-relaxed">
              The all-in-one student engagement platform. Events, venues, clubs, sports, wellbeing: unified in one platform your students will actually use.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/demo" className="bg-primary text-on-primary font-headline font-bold px-8 py-4 rounded-full text-lg shadow-xl shadow-primary/30 hover:opacity-90 transition-all">Book a Demo</Link>
              <button className="bg-surface-container-high text-on-surface font-headline font-bold px-8 py-4 rounded-full text-lg hover:bg-surface-container-highest transition-all">Explore Platform</button>
            </div>
          </div>

          {/* Hero visual */}
          <div className="relative h-[600px] flex items-center justify-center" style={{perspective:'1000px'}}>
            {/* Interest cards */}
            {[
              { icon: 'sports_tennis', label: 'Interest added - Tennis', delay: '0s', color: 'bg-tertiary-container text-on-tertiary-container' },
              { icon: 'smart_toy', label: 'Robotics club - Hackathon tonight', delay: '3s', color: 'bg-secondary-container text-secondary' },
              { icon: 'edit_note', label: 'Writing contest - Deadline tomorrow', delay: '6s', color: 'bg-primary-container text-on-primary-container' },
            ].map((c, i) => (
              <div key={i} className="absolute left-1/4 bottom-0 z-50 w-72 interest-card" style={{animationDelay: c.delay}}>
                <div className="bg-surface-container-lowest shadow-2xl p-4 rounded-xl flex items-center gap-4 border-2 border-primary/10">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${c.color}`}>
                    <span className="material-symbols-outlined text-sm">{c.icon}</span>
                  </div>
                  <div>
                    <p className="font-label font-bold text-[10px] text-on-surface-variant uppercase">Activity Feed</p>
                    <p className="font-headline font-bold text-xs">{c.label}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Ranking cards */}
            {[
              { rank: '#1', color: 'text-primary', name: 'Elias Vance', sport: 'Tennis', pts: '4,280 Points', delay: '0s' },
              { rank: '#3', color: 'text-secondary', name: 'Sarah Chen', sport: 'Badminton', pts: '3,950 Points', delay: '4s' },
              { rank: '#5', color: 'text-tertiary', name: 'Marcus Thorne', sport: 'Squash', pts: '3,120 Points', delay: '8s' },
            ].map((r, i) => (
              <div key={i} className="absolute right-0 top-0 z-50 w-64 ranking-card" style={{animationDelay: r.delay}}>
                <div className="bg-surface-container-lowest shadow-2xl p-4 rounded-xl flex items-center gap-4 border-2 border-primary/10">
                  <div className="text-center w-10">
                    <p className="text-[8px] font-label font-bold text-slate-400 uppercase">Rank</p>
                    <p className={`font-headline font-black text-xl ${r.color}`}>{r.rank}</p>
                  </div>
                  <div className="h-8 w-px bg-slate-200"></div>
                  <div>
                    <p className="text-[8px] font-label font-bold text-slate-400 uppercase">{r.name} &bull; {r.sport}</p>
                    <p className="font-headline font-bold text-sm text-on-surface">{r.pts}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Main slider stack */}
            <div className="relative w-full max-w-sm aspect-[3/4]">
              {[
                { src: 'https://lh3.googleusercontent.com/aida/ADBb0ujndfy2IaCOmd5FbeXuwIm0GGM0CL3U6840gFkh5HVMoqgB1g3Dc5D0IM4ic4wyFjMUo_oNjydQLtc3_It08AGTynw2GUFetWqcgRbgDtk6yDN4-vWnoMXs5GIIYOI2EZ2Mypg7XSIrDJkbrkueNOaeouf9LxRrDyZLvlyZm0zw3HKsj9-zFbj0HgcZKlIdllpxrptLuSRNrCehOsQgd4i5zlE7rM7eQD7Qpa-Z1FWouVu4lj-eJOBxM6SooA8yq7HCp_PpYjXt', label: 'Collaborate Better.' },
                { src: 'https://lh3.googleusercontent.com/aida/ADBb0uicEeIN-ujAAVyZBBQ1eU5VKemibXIuFSlSkdjbc_6_qbUwphPTQfqezQPtouDKeDpmsK4KVyjWEe5Ps_eW6Hl-K2VaKKXIbn5hLqoyLooVIeT-hbLP2347pSKuWzSfMRmPezCS3-1oCqoEa-mj1gSEOHZbXVV9Oi8_qLuwPC8aUMbhYIqJcAk1HQKiInIS5tAibuPIvPh3zznk8A4lGuAOw5WJY82puEG1aLPQJoOgTZM41_6AsAk87mHX-RFcjTnn7GCIZ6HB1w', label: 'Game On.' },
                { src: 'https://lh3.googleusercontent.com/aida/ADBb0ujHpqNwvr8IIsS3AnPBvp_IHGY8mJ7j8zSP4LP5L-N8LKcij1cZXX4yR-bzrO116OYqtAjFtsY82RHJkbO0NlBThJG_w6c8EUIMXuO2RPepE7gcyfsRcAnVLbNJo-ml5K3N_U6_2UBD6kvT9kToPDU6tTNOXeWIbA_TDxux1m5n0eg1QdOeUwGZIz4Z9pVmq7S23Z7oKTpdnbQ5gUzKwwcGISsOM-dRnlGJkePJDDHutvUeJLgTvpQ7VDFKDfnFm5jmYG9z2Yf-DQ', label: 'Connect Better.' },
                { src: 'https://lh3.googleusercontent.com/aida/ADBb0uib4KWy0BsxPbLgimSZB1bYCABtaWEgmjw8lQyKcQUwN9u_LwXEnxdZdyO-utfKwuRebLQIwALMbsPyG0kU0J6BRkVyMtVOgVbvuGR1-7eAUufSJrgjtepj7Jv4ocf4nnJLDR942BaXVsVQN4zVhfGf9MBcnnMxJvixoyNc5c-nZujdv3ZAbAXu6pc7t6iZJmfuaV4dBBVY6uHF3Nd8Mqm-mNflvjH2Fa7g3ydgV04_OUVBLxGv0FI7D7PttxbqeIQHt5n9WUhl', label: 'Find Your Tribe.' },
                { src: 'https://lh3.googleusercontent.com/aida/ADBb0uhlUNsdmcE26e6Uk-zCdiaZ9hEbioRvd2OWSsH8grJPiBCNf0YrkSBLlQDkmcFgCNCUUnnVzbLaYQhFn_xgkHL9VAMxeBYo4TqEBCo905FnXwnye_wQIydK3aUNtAZExBosXZBk-QKn7feHPJsZBaHas_h0zA8UcHN9XW_Kq8R0ovwOFws17FaZOpg7kmsegxBZFI3PCr8fq1608aRNUVTv-Tpyz0zBPuYzm1-3-oraMOObQyHUcVe3c9qCy3-Nvc6Nk6D3oRFSkA', label: 'Varsity Arena.' },
              ].map((card, i) => (
                <div key={i} className="slider-card bg-surface-container-lowest rounded-3xl shadow-2xl overflow-hidden border border-surface-container">
                  <img alt={card.label} className="w-full h-full object-cover" src={card.src} />
                  <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/90 to-transparent text-white">
                    <p className="font-headline font-bold text-2xl">{card.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Ecosystem */}
        <section className="bg-surface-container-low py-24">
          <div className="max-w-7xl mx-auto px-8">
            <div className="text-center mb-16 space-y-4">
              <h2 className="font-headline font-extrabold text-4xl lg:text-5xl text-on-surface tracking-tight">Everything your campus needs</h2>
              <p className="text-on-surface-variant max-w-2xl mx-auto">Scalable solutions across all educational tiers, designed with precision and engagement in mind.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { tier: 'University', color: 'text-secondary', border: 'hover:border-secondary/20', iconBg: 'bg-secondary-container text-secondary', icon: 'school', title: 'Higher Ed Hub', desc: 'Empowering adults with sophisticated networking, career alignment, and elite sports coordination.', features: ['Varsity Sports Engine', 'Alumni Career Network', 'Venue Booking API'], btn: 'University Access', btnClass: 'border border-secondary text-secondary hover:bg-secondary hover:text-white', to: '/' },
                { tier: 'School', color: 'text-primary', border: 'hover:border-primary/20', iconBg: 'bg-primary-container text-on-primary-container', icon: 'history_edu', title: 'Secondary Suite', desc: 'Building community and focus during the most transformative years of a student\'s life.', features: ['Club & Society Manager', 'Wellbeing Pulse Checks', 'House Points Tracking'], btn: 'School Portal', btnClass: 'bg-primary text-white hover:opacity-90', to: '/school' },
                { tier: 'Preschool', color: 'text-tertiary', border: 'hover:border-tertiary/20', iconBg: 'bg-tertiary-container text-on-tertiary-container', icon: 'child_care', title: 'Early Years Engage', desc: 'Bridging the gap between educators and parents through safe, interactive communication.', features: ['Secure Photo Sharing', 'Developmental Milestones', 'Guardian Notifications'], btn: 'Preschool Access', btnClass: 'border border-tertiary text-tertiary hover:bg-tertiary hover:text-white', to: '/preschool' },
              ].map((card) => (
                <div key={card.tier} className={`group bg-surface-container-lowest p-8 rounded-xl shadow-sm hover:shadow-2xl transition-all duration-500 border border-transparent ${card.border} hover:-translate-y-2`}>
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform ${card.iconBg}`}>
                    <span className="material-symbols-outlined text-3xl">{card.icon}</span>
                  </div>
                  <span className={`font-label font-bold text-xs uppercase tracking-widest ${card.color}`}>{card.tier}</span>
                  <h3 className="font-headline font-bold text-2xl mt-2 mb-4">{card.title}</h3>
                  <p className="text-on-surface-variant mb-6">{card.desc}</p>
                  <ul className="space-y-3 mb-8">
                    {card.features.map(f => (
                      <li key={f} className="flex items-center gap-3 text-sm font-medium">
                        <span className="material-symbols-outlined text-primary text-sm">check_circle</span> {f}
                      </li>
                    ))}
                  </ul>
                  <Link to={card.to} className={`block w-full py-3 rounded-full font-headline font-bold text-center transition-colors ${card.btnClass}`}>{card.btn}</Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pillars */}
        <section className="py-24 overflow-hidden">
          <div className="max-w-7xl mx-auto px-8 mb-16">
            <h2 className="font-headline font-extrabold text-4xl lg:text-5xl text-on-surface tracking-tight">
              Pillars of student engagement, <span className="text-primary italic">Unified.</span>
            </h2>
          </div>
          <div className="overflow-hidden">
            <div className="pillar-track-continuous">
              {pillarsDouble.map((p, i) => (
                <div key={i} className="flex-shrink-0 w-72 mx-4 bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden border border-outline-variant/10">
                  <div className="h-44 overflow-hidden">
                    <img src={p.img} alt={p.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-5 flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">{p.icon}</span>
                    <span className="font-headline font-bold text-sm">{p.title}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Roles */}
        <section className="bg-surface-container-low py-24 overflow-hidden">
          <div className="max-w-7xl mx-auto px-8 mb-16 text-center">
            <h2 className="font-headline font-extrabold text-4xl lg:text-5xl text-on-surface tracking-tight">Built for <span className="text-primary italic">Every Role</span></h2>
            <p className="text-on-surface-variant mt-4 max-w-2xl mx-auto">From students discovering their place to IT directors securing the ecosystem.</p>
          </div>
          <div className="overflow-hidden">
            <div className="role-track">
              {rolesDouble.map((r, i) => (
                <div key={i} className="flex-shrink-0 w-80 mx-4 bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm border border-outline-variant/10">
                  <div className="h-52 overflow-hidden">
                    <img src={r.img} alt={r.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-6">
                    <h4 className="font-headline font-bold text-lg mb-2">{r.title}</h4>
                    <p className="text-on-surface-variant text-sm">{r.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-8">
          <div className="max-w-5xl mx-auto orange-editorial-gradient rounded-3xl p-12 md:p-20 text-center relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none select-none">
              <span className="font-headline font-black text-[18rem] text-white leading-none">TRIBE</span>
            </div>
            <div className="relative z-10 space-y-8">
              <h2 className="font-headline text-4xl md:text-6xl font-extrabold text-white tracking-tighter">Revolutionize your campus experience today.</h2>
              <p className="text-white/80 text-lg max-w-2xl mx-auto">Join 200+ institutions already transforming student life with Campus Tribe.</p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link to="/register" className="bg-white text-secondary font-headline font-bold px-10 py-4 rounded-full text-lg hover:opacity-90 transition-all shadow-2xl">Get Started Free</Link>
                <Link to="/demo" className="border-2 border-white text-white font-headline font-bold px-10 py-4 rounded-full text-lg hover:bg-white/10 transition-all">Watch Demo</Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
