import terser from '@rollup/plugin-terser';

export default {
    input: 'scripts/age-estimator.js',
    output: [{
            file: 'build/age-estimator.js',
            format: 'es',
        }, {
            file: 'build/age-estimator.min.js',
            format: 'es',
            name: 'version',
            plugins: [
                terser({mangle: { keep_classnames: true, keep_fnames: true }}),
            ],
        },
    ],
};
