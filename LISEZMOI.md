# TIMELINE.VISION — site web

## Les fichiers
- `index.html`, `style.css`, `script.js` : le site.
- `videos.js` : la liste des vidéos (une ligne par vidéo). C’est le seul fichier à modifier pour ajouter une vidéo.
- `videos/spots`, `videos/content`, `videos/events` : les vidéos (version complète + extrait `-preview`).
- `images/` : ta photo (`hero.jpg`) et les images d’aperçu des vidéos.
- `cv/Yacine_Tiar_CV.pdf` : ton CV (bouton « View my CV » dans About me).

## Ajouter une vidéo
1. Envoie la vidéo brute à Claude : il te rend 3 fichiers (`nom.mp4`, `nom-preview.mp4`, `nom.jpg`) et la ligne à ajouter.
2. Sur GitHub, dans `videos/<section>/` : Add file → Upload files → dépose les 2 vidéos → Commit changes.
3. Pareil pour l’image dans `images/<section>/`.
4. Ouvre `videos.js` → icône crayon → colle la ligne dans la bonne liste → Commit changes.
5. Cloudflare met le site à jour tout seul en une minute environ.

Règle à respecter : chaque fichier doit faire moins de 25 Mo.
