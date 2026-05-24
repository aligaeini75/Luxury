export default {
  content: ['./index.html', './src/**/*.{vue,ts}'],
  theme: {
    extend: {
      fontFamily: {
        persian: ['Estedad','Dana','IRANSansX','Yekan Bakh','IRANYekanX','IRANYekan','Vazirmatn','Tahoma','Arial','sans-serif'],
      },
      colors: {
        lux: '#030201',
        obsidian: '#080603',
        velvet: '#120d05',
        wine: '#1b1206',
        gold: '#d6ad52',
        champagne: '#fff0bd',
        bronze: '#8a6427',
        ember: '#b7791f',
        emerald: '#10b981',
        danger: '#ef4444',
        purplelux: '#d6ad52',
        muted: '#b8aa8a'
      },
      boxShadow: {
        aura: '0 0 90px rgba(214,173,82,.20)',
        goldSoft: '0 24px 90px rgba(214,173,82,.16)',
        green: '0 0 60px rgba(16,185,129,.16)',
        red: '0 0 70px rgba(239,68,68,.14)'
      },
      animation: {
        float: 'float 8s ease-in-out infinite',
        pulseSoft: 'pulseSoft 2.2s ease-in-out infinite',
        goldBreath: 'goldBreath 7s ease-in-out infinite'
      },
      keyframes: {
        float: {'0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-18px)' }},
        pulseSoft: {'0%,100%': { opacity: '.55', transform: 'scale(1)' }, '50%': { opacity: '1', transform: 'scale(1.06)' }},
        goldBreath: {'0%,100%': { opacity: '.46', transform: 'scale(1)' }, '50%': { opacity: '.86', transform: 'scale(1.08)' }}
      }
    }
  },
  plugins: []
}
