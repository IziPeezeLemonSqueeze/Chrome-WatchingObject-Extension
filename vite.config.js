import { defineConfig } from 'vite'

export default defineConfig({
	build: {
		lib: {
			entry: './src/tools/codemirror-standalone.ts',
			name: 'CodeMirrorBundle',
			fileName: () => `codemirror-bundle.js`,
			formats: ['umd']
		},
		emptyOutDir: false,
		outDir: 'src/public'
	}
})
