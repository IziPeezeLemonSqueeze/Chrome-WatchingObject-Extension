import { EditorView, basicSetup } from "codemirror"
import { javascript } from "@codemirror/lang-javascript"

// Esportiamo CodeMirror come globale
(window as any).CodeMirrorBundle = {
	EditorView,
	basicSetup,
	javascript
}
