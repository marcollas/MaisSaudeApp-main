// Central image map kept minimal — most UI now uses icons instead of placeholder images.
// If you want to provide actual photos, replace these requires with your image files in assets/images.
const IMAGES = {
  // doctor remains as a branded/local asset used on the login screen
  doctor: require('../../assets/images/mais_saude_logo.png'),
  // other entries intentionally set to null as we prefer icon-based UI
  avatar: require('../../assets/images/mais_saude_logo.png'),
  challenge: null,
  mapPlaceholder: null,
  workoutMeditation: null,
  workoutStories: null,
  workoutRelax: null,
  workoutAerobic: null,
  workoutBoxing: null,
  workoutPosture: null,
  workout5k: null,
  workout10k: null,
};

export default IMAGES;
