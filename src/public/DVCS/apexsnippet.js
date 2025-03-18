CodeMirror.defineMode('apexsnippet', function (config, parserConfig) {
	// Usa il mode Java esistente (di solito definito come "text/x-java")
	var javaMode = CodeMirror.getMode(config, 'text/x-java');
	// Definiamo l'overlay mode per riconoscere le nuove keyword
	var customOverlay = {
		token: function (stream, state) {
			// Controlla se il token inizia con "${$"
			if (stream.match('${$', false)) {
				// 1. Pattern per ${$RAND(0-99)} oppure ${$RND(0-99)}
				if (stream.match(/\$\{\$(RAND|RND)\(\d{1,2}\)\}/)) {
					return 'custom-random-number'; // Ritorna un token che applicherà lo stile 'cm-custom-random-number'
				}
				// 2. Pattern per ${$RANDSTR(0-99)}
				if (stream.match(/\$\{\$RANDSTR\(\d+\)\}/)) {
					return 'custom-random-string';
				}
				// 3. Pattern per variabili: ${$STRnome_variabile}, ${$NMBnome_variabile}, ${$BOLnome_variabile}, ${$IDnome_variabile}, ${$Vnome_variabile}, ${$nome_variabile}
				//    Facoltativamente con valore di default: ad esempio ${$STRnome_variabile : defaultValue}
				if (
					stream.match(
						/\$\{\$(?:STR|NMB|BOL|ID|V)[A-Za-z]+(?::[A-Za-z0-9_ ]+)?\}/g
					)
				) {
					return 'custom-variable';
				}
				// 4. Pattern per ${$PCK[(foo : foovalue),(foo1 : foo1value)]}
				if (stream.match('${$PCK', false)) {
					// Caso 1: Definizione con picklist, deve contenere la parte tra parentesi tonde e quadre
					if (
						stream.match(
							/\$\{\$PCK\(\s*[a-zA-Z_]\w*\s*\)\s*\[\s*(\([^)]*\)(\s*,\s*\([^)]*\))*)\s*\]\}/
						)
					) {
						return 'custom-pck-def'; // Questo token verrà stilizzato con .cm-custom-pck-def
					}
					// Caso 2: Richiamo senza la parte tra parentesi quadre
					if (stream.match(/\$\{\$PCK\(\s*[a-zA-Z_]\w*\s*\)\}/)) {
						return 'custom-pck-call'; // Questo token verrà stilizzato con .cm-custom-pck-call
					}
				}
			}
			// Se nessun pattern viene riconosciuto, consuma un carattere e passa oltre
			stream.next();
			return null;
		},
	};

	// Combina il mode base Java con il nostro overlay
	return CodeMirror.overlayMode(javaMode, customOverlay);
});

// Registra il nuovo MIME type associato al nuovo mode
CodeMirror.defineMIME('text/apexsnippet', 'apexsnippet');
