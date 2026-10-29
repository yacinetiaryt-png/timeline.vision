/* ============================================================
   VIDÉOS DU SITE — une ligne = une vidéo, dans l’ordre d’affichage.

   Ajouter une vidéo :
   1. Mets ses 3 fichiers sur GitHub, dans la bonne section :
        videos/<section>/nom.mp4           version complète, avec le son
        videos/<section>/nom-preview.mp4   extrait muet de 7 secondes
        images/<section>/nom.jpg           image d’aperçu
   2. Copie une ligne de la même section ci-dessous, colle-la à l’endroit
      voulu et remplace « nom » + la durée affichée sur la carte.
   3. Enregistre (Commit changes) : le site se met à jour tout seul.

   La grille « be part of our work » pioche 12 vidéos au hasard dans ces
   trois listes, donc une nouvelle vidéo y apparaît aussi automatiquement.
   ============================================================ */

// Commercials (dossier « spots »)
window.SPOT_VIDEOS = [
  { duration: '0:58', full: 'videos/spots/abdoulay-clear.mp4', preview: 'videos/spots/abdoulay-clear-preview.mp4', poster: 'images/spots/abdoulay-clear.jpg' },
  { duration: '0:23', full: 'videos/spots/product-trailer.mp4', preview: 'videos/spots/product-trailer-preview.mp4', poster: 'images/spots/product-trailer.jpg' },
  { duration: '1:01', full: 'videos/spots/3ars-anes.mp4', preview: 'videos/spots/3ars-anes-preview.mp4', poster: 'images/spots/3ars-anes.jpg' },
  { duration: '0:37', full: 'videos/spots/timeline-x-abdoulay.mp4', preview: 'videos/spots/timeline-x-abdoulay-preview.mp4', poster: 'images/spots/timeline-x-abdoulay.jpg' },
  { duration: '0:57', full: 'videos/spots/sprite.mp4', preview: 'videos/spots/sprite-preview.mp4', poster: 'images/spots/sprite.jpg' },
  { duration: '0:53', full: 'videos/spots/siv.mp4', preview: 'videos/spots/siv-preview.mp4', poster: 'images/spots/siv.jpg' },
  { duration: '0:37', full: 'videos/spots/masters-spot.mp4', preview: 'videos/spots/masters-spot-preview.mp4', poster: 'images/spots/masters-spot.jpg' },
  { duration: '0:34', full: 'videos/spots/imir-logistiques.mp4', preview: 'videos/spots/imir-logistiques-preview.mp4', poster: 'images/spots/imir-logistiques.jpg' },
  { duration: '0:34', full: 'videos/spots/chiken-street.mp4', preview: 'videos/spots/chiken-street-preview.mp4', poster: 'images/spots/chiken-street.jpg' },
  { duration: '0:37', full: 'videos/spots/mag-gym.mp4', preview: 'videos/spots/mag-gym-preview.mp4', poster: 'images/spots/mag-gym.jpg' },
];

// Content creation (dossier « content »)
window.CONTENT_VIDEOS = [
  { duration: '0:21', full: 'videos/content/v3.mp4', preview: 'videos/content/v3-preview.mp4', poster: 'images/content/v3.jpg' },
  { duration: '1:14', full: 'videos/content/nadir.mp4', preview: 'videos/content/nadir-preview.mp4', poster: 'images/content/nadir.jpg' },
  { duration: '0:13', full: 'videos/content/anes-v1.mp4', preview: 'videos/content/anes-v1-preview.mp4', poster: 'images/content/anes-v1.jpg' },
  { duration: '0:17', full: 'videos/content/anes-v3.mp4', preview: 'videos/content/anes-v3-preview.mp4', poster: 'images/content/anes-v3.jpg' },
  { duration: '0:48', full: 'videos/content/ghrinni.mp4', preview: 'videos/content/ghrinni-preview.mp4', poster: 'images/content/ghrinni.jpg' },
  { duration: '0:37', full: 'videos/content/yacine-2025.mp4', preview: 'videos/content/yacine-2025-preview.mp4', poster: 'images/content/yacine-2025.jpg' },
  { duration: '0:29', full: 'videos/content/full-motion.mp4', preview: 'videos/content/full-motion-preview.mp4', poster: 'images/content/full-motion.jpg' },
  { duration: '0:35', full: 'videos/content/resolve-client.mp4', preview: 'videos/content/resolve-client-preview.mp4', poster: 'images/content/resolve-client.jpg' },
  { duration: '0:51', full: 'videos/content/aymen.mp4', preview: 'videos/content/aymen-preview.mp4', poster: 'images/content/aymen.jpg' },
];

// Events (dossier « events »)
window.EVENT_VIDEOS = [
  { duration: '0:41', full: 'videos/events/venus-recap.mp4', preview: 'videos/events/venus-recap-preview.mp4', poster: 'images/events/venus-recap.jpg' },
  { duration: '0:53', full: 'videos/events/hisense.mp4', preview: 'videos/events/hisense-preview.mp4', poster: 'images/events/hisense.jpg' },
  { duration: '0:55', full: 'videos/events/goldy-fox.mp4', preview: 'videos/events/goldy-fox-preview.mp4', poster: 'images/events/goldy-fox.jpg' },
  { duration: '0:40', full: 'videos/events/video-recap.mp4', preview: 'videos/events/video-recap-preview.mp4', poster: 'images/events/video-recap.jpg' },
  { duration: '0:47', full: 'videos/events/gazel.mp4', preview: 'videos/events/gazel-preview.mp4', poster: 'images/events/gazel.jpg' },
];
