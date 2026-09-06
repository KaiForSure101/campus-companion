import { initializeShell } from './layout.js';
import { STORAGE_KEYS, loadData, saveData } from './storage.js';
import { announce } from './utils.js';

initializeShell();

const defaultProfile = {
  displayName: 'Campus Companion user',
  bio: 'Add a short introduction from the form.',
  avatar: '',
};
const profile = {
  ...defaultProfile,
  ...loadData(STORAGE_KEYS.profile, defaultProfile, 'profile'),
};

const profileForm = document.querySelector('#profile-form');
const nameInput = document.querySelector('#profile-name');
const bioInput = document.querySelector('#profile-bio');
const pictureInput = document.querySelector('#profile-picture');
const avatar = document.querySelector('#profile-avatar');
const previewName = document.querySelector('#profile-preview-name');
const previewBio = document.querySelector('#profile-preview-bio');
const feedback = document.querySelector('#profile-feedback');
const removePictureButton = document.querySelector('#remove-profile-picture');

function getInitials(name) {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('') || 'CC';
}

function renderProfile() {
  nameInput.value = profile.displayName;
  bioInput.value = profile.bio;
  previewName.textContent = profile.displayName;
  previewBio.textContent = profile.bio || 'Add a short introduction from the form.';
  avatar.textContent = profile.avatar ? '' : getInitials(profile.displayName);
  avatar.style.backgroundImage = profile.avatar ? `url(${profile.avatar})` : '';
  avatar.classList.toggle('profile-avatar--image', Boolean(profile.avatar));
  avatar.setAttribute('aria-label', profile.avatar ? `Profile picture for ${profile.displayName}` : `Profile picture placeholder for ${profile.displayName}`);
}

function readPicture(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve('');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      reject(new Error('Please choose an image smaller than 2 MB.'));
      return;
    }
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(String(reader.result)));
    reader.addEventListener('error', () => reject(new Error('The profile picture could not be read.')));
    reader.readAsDataURL(file);
  });
}

profileForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const displayName = nameInput.value.trim();
  if (!displayName) {
    announce(feedback, 'Please enter a display name.');
    nameInput.focus();
    return;
  }

  try {
    const selectedFile = pictureInput.files?.[0];
    if (selectedFile) profile.avatar = await readPicture(selectedFile);
    profile.displayName = displayName;
    profile.bio = bioInput.value.trim();
    saveData(STORAGE_KEYS.profile, profile);
    pictureInput.value = '';
    renderProfile();
    announce(feedback, 'Your profile was saved in this browser.');
  } catch (error) {
    announce(feedback, error.message);
  }
});

removePictureButton?.addEventListener('click', () => {
  profile.avatar = '';
  saveData(STORAGE_KEYS.profile, profile);
  pictureInput.value = '';
  renderProfile();
  announce(feedback, 'Your profile picture was removed.');
});

renderProfile();
