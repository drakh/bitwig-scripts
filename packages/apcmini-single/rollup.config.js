import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';


export default {
    input: './dist/index.js',
    treeshake: true,
    output: {
        file: '../../dist/AKAI APC MINI single/AKAI APC MINI single.control.js',
    },
    plugins: [nodeResolve(), commonjs()],
};
