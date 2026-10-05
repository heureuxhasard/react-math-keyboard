# react-math-keyboard

Champ de saisie mathématique React (`MathInput`) et son clavier virtuel, publié sur npm (paquet public
`react-math-keyboard`, licence ISC). Bâti sur `mathquill4keyboard`, un fork de MathQuill (virgule décimale, `×` au lieu
de `·`). Consommé par `../sciencelive-front` ; éditeur Heureux Hasard. Le `README.md`, en anglais, est la documentation
publique des props. Vue d'ensemble dans le workspace `github.com/heureuxhasard/monorepo`, qui clone ce dépôt dans un
sous-dossier (`make bootstrap`) : `../README.md`, `../ARCHITECTURE-SYSTEME.md`, `../CLAUDE.md`.

## Commandes

| Commande | Effet |
|---|---|
| `npm run build` | rollup → `dist/` (CJS `dist/cjs`, ESM `dist/esm`, types `dist/index.d.ts`) ; `rollup-plugin-visualizer` écrit `stats.html` et l'ouvre dans le navigateur |
| `npm run dev` | rollup en mode surveillance |
| `npm run storybook` | Storybook sur `:6006` (`src/mathInput/mathInput.stories.tsx`) ; `build-storybook` → `storybook-static/` |
| `npm publish` | `prepublishOnly` lance le build ; seul `dist/` est publié (`files`). **Jamais sans demande explicite** |

Aucun `npm install`, build ou publication sans demande explicite. Pas de test, pas d'ESLint, pas de CI : vérifier un
changement dans Storybook, puis dans le front.

Publication (d'après l'historique) : un commit de version seul (`2.0.19`), puis `npm publish`. Le front suit par
`npm i react-math-keyboard@<version>` (`^2.0.19` dans son `package.json` au 5 octobre 2026).

## Structure

- `src/index.ts` : API publique. Export par défaut `MathInput` ; types `KeyId`, `KeyProps`, `MathInputProps` ;
  `allKeysProps`, `KeysPropsMap`. Le front en dépend : ne rien retirer ni renommer sans coordination.
- `src/mathInput/mathInput.tsx` : le composant. Au montage (`useEffect`, donc jamais côté serveur), il pose
  `window.jQuery`, charge MathQuill par `require`, enregistre les objets intégrés (`embedObjects.ts` : `tokenOu`,
  `tokenEt`, `tokenAucun`…, plus la prop `registerEmbedObjects`) et crée le `MathField` sur un `<span>`. Le `MathField`
  est partagé avec le clavier par `MathFieldContext` (`mathfieldContext.ts`). `setValue` reçoit le LaTeX à chaque édition.
- Ouverture du clavier : demandes « open » / « close » regroupées par un délai de 300 ms ; un `mousedown` sur `window`
  ferme le clavier si le clic tombe hors d'un élément dont l'`id` contient `mq-keyboard-<id du champ>`, ou sur un élément
  dont l'`id` contient `close`. Clavier ouvert : `padding-bottom: 300px` sur `body` ou sur `#<rootElementId>`, défilement
  pour garder le champ visible (`scrollType`, `scrollTriesToShowLastElement`).
- `src/components/portal.tsx` : le clavier est rendu dans un portail attaché à `document.body` (`z-index` 1310).
- `src/keyboard/keyboard.tsx` : bascule entre `layout/numericLayout.tsx` et `layout/alphabetLayout.tsx` (passer en
  alphabétique ouvre un bloc `\text`). `toolbar/` : barre d'onglets ; un onglet = un groupe de touches (`ToolbarTabIds` =
  `KeyGroupIds`).
- `src/keyboard/keys/` : les touches.
  - `keyIds.ts` : l'union `KeyId` de tous les identifiants.
  - `key.tsx` : `KeyProps` et le composant `Key`. Une touche agit par `mathfieldInstructions` (`method` parmi `write`,
    `cmd`, `keystroke`, `typedText` ; `content` en chaîne ou en fonction du LaTeX courant), ou par `onClick`, puis
    `postKeystrokes`. `labelType` : `tex` (rendu par `MQ.StaticMath`), `raw` ou `svg`. `keypressId` : caractère du
    clavier physique accepté quand `forbidOtherKeyboardKeys` est actif. `groups` : onglets où la touche apparaît.
  - Un fichier par famille (`algebraKeys.ts`, `unitKeys.ts`, `moleculeKeys.ts`…), réunies dans `keys.ts`
    (`allKeysProps`, `KeysPropsMap`). Groupes et libellés fr / en : `keyGroup.ts`.
- `src/style/` : `keyboardTheme.ts` (couleurs `grey`, `blue`, `purple`…) et `applyTheme.ts`, qui écrit les variables
  CSS `--keyboard-color-*` sur `document.documentElement`. `src/mathInput/style.css` est injecté par rollup (postcss).
- `src/types/types.ts` : interface `MathField` (sous-ensemble de l'API MathQuill) et `MathfieldInstructions`.

## Ajouter une touche

1. Ajouter l'identifiant à l'union `KeyId` (`src/keyboard/keys/keyIds.ts`).
2. Déclarer ses `KeyProps` dans le fichier de sa famille, avec ses `groups` ; une nouvelle famille s'ajoute à
   `allKeysProps` (`keys.ts`), un nouveau groupe à `KeyGroupIds` et `keyGroups` (`keyGroup.ts`).
3. Vérifier dans Storybook, publier (sur demande), mettre à jour le front, puis **recopier l'identifiant** dans
   `../math-exercises/src/types/keyIds.ts`.

Un `KeyId` ne se renomme ni ne se supprime : les générateurs de `math-exercises` les citent (`getKeys`) et le back en
enregistre en base (`GeneratorForm.keys`). Écart constaté le 5 octobre 2026 : `dm`, `km`, `km2`, `litre`, `m2`, `meter`,
`mm` et `star` existent ici mais pas dans la copie de `math-exercises` (`origin/main`).

## Utilisation dans le front

`sciencelive-front/Components/KeyBoards/mathInput.tsx` (`MLMathInput`) enveloppe `MathInput` : `rootElementId="__next"`,
`lang="fr"`, remplacement du signe `−` par `-` dans la valeur. Utilisé par les champs de réponse des quiz
(`Activities/Quizzes/Components/Student/…`), les nœuds de `Components/D3Charts/` et le choix des touches d'un
générateur (`Layouts/GeneratorForm/keyboardConstructor.tsx`, qui liste `allKeysProps` et `KeysPropsMap`). Le LaTeX saisi arrive tel quel dans les
VEA de `math-exercises` (virgule décimale, unités en `\text{…}`).

## Conventions et pièges

- Code et `README.md` en anglais (paquet public) ; ce fichier en français.
- `.gitignore` exclut `package-lock.json` et `dist`, mais le lockfile est versionné quand même ;
  `storybook-static/` est versionné aussi.
- Les `id` du DOM (`mq-keyboard-<id>-container`, `-field`, `-key-<KeyId>`, `-button-key-<KeyId>`) servent à la détection
  des clics et au rendu des libellés : ne pas les changer sans relire `mathInput.tsx` et `key.tsx`. Un `id` contenant
  `close` ferme le clavier.
- `initialLatex` n'est lu qu'une fois ; ensuite, passer par le `MathField` (`setMathfieldRef`).
- Une touche `custom` reçoit un identifiant aléatoire à chaque rendu (`key.tsx`).
