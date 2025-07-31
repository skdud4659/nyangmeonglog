export default {
    content: ['./index.html', './src/**/*.{ts,tsx}'],
    theme: {
        extend: {
            colors: {
                gray_1: '#ffffff',
                gray_2: '#E4E4E4',
                gray_3: '#C5C5C5',
                gray_4: '#A9A9A9',
                gray_5: '#8C8C8C',
                gray_6: '#737373',
                gray_7: '#5F5F5F',
                gray_8: '#404040',
                gray_9: '#2B2B2B',
                gray_10: '#111E30',
                lightyellow: '#FFE899',
                error: '#F05C5C',
                primary: '#F38E8E',
            },
            fontSize: {
                h1: ['34px', { fontWeight: '700' }],
                h2: ['28px', { fontWeight: '700' }],
                h3: ['22px', { fontWeight: '700' }],
                h4: ['20px', { fontWeight: '700' }],
                subheadline: ['18px', { fontWeight: '400' }],
                'subheadline-bold': ['18px', { fontWeight: '700' }],
                body1: ['16px', { fontWeight: '400' }],
                'body1-bold': ['16px', { fontWeight: '700' }],
                body2: ['14px', { fontWeight: '400' }],
                'body2-bold': ['14px', { fontWeight: '700' }],
                label: ['12px', { fontWeight: '400' }],
                'label-bold': ['12px', { fontWeight: '700' }],
            },
            fontFamily: {
                sans: ['Pretendard', 'sans-serif'],
            },
            borderRadius: {
                '4xl': '50px',
            },
        },
    },
    plugins: [],
};
