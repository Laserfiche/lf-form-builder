import { Plugin } from 'vite';
interface BundleLflessOptions {
    /**
     * Whether to validate LESS syntax during build
     */
    validateSyntax?: boolean;
    /**
     * Output directory relative to build output (default: 'assets')
     */
    outDir?: string;
}
export declare function bundleLfless(options?: BundleLflessOptions): Plugin;
export {};
