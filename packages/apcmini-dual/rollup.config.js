import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';


export default {
    input: './dist/index.js',
    treeshake: true,
    output: {
        file: '../../dist/AKAI APC MINI dual/AKAI APC MINI dual.control.js',
    },
    plugins: [nodeResolve(), commonjs()],
};
