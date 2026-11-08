//@ the menus the editor saved: the start screen, the pause menu, the settings and their pages, as data. Written by the Co Engine editor; it sorts first in src/. Edit it in the editor rather than here.
  CO.menus({
    "theme": {
      "accent": "#f5b53d",
      "panel": "#2d3e52",
      "text": "#eef1f5",
      "muted": "#a0acb8",
      "width": 550,
      "radius": 21,
      "dim": 0.86
    },
    "start": {
      "title": "Park Co",
      "subtitle": "Sell the tickets, work the ride, keep the queue moving.",
      "buttons": [
        {
          "label": "Play",
          "action": "play",
          "primary": true
        },
        {
          "label": "Save slots",
          "action": "slots"
        },
        {
          "label": "Settings",
          "action": "settings"
        },
        {
          "label": "Changelog",
          "action": "page Changelog"
        },
        {
          "label": "How to play",
          "action": "guide"
        },
        {
          "label": "Credits",
          "action": "page Credits"
        },
        {
          "label": "Quit",
          "action": "quit"
        }
      ]
    },
    "pause": {
      "title": "Paused",
      "buttons": [
        {
          "label": "Resume",
          "action": "resume",
          "primary": true
        },
        {
          "label": "Settings",
          "action": "settings"
        },
        {
          "label": "How to play",
          "action": "guide"
        },
        {
          "label": "Main menu",
          "action": "quit"
        }
      ]
    },
    "settings": {
      "hide": [],
      "custom": []
    },
    "pages": {
      "Changelog": {
        "title": "Version history:",
        "text": "[ v1.7.2 ]\n- Added missing leftovers from previous update\n\n[ v1.7.1 ]\n- Added \"changelog\" page to the MainMenu\n- Added \"credits\" page to the MainMenu\n- Changed theming of MainMenu\n\n[ v1.7.0 - Mayor Update ]\n- Added three new rides: Dragon Ride, Dream Flight and Dance Macabre\n- Live CCTV camera feeds in every operator booth, showing the queue and the platform\n- Improved frame rate: static geometry now merges by material, about a fifth faster\n- Fixed guests walking through booth floors, and their boarding and exit paths\n- Fixed the departure signals, the dispatch interlock and the booth back wall\n- Fixed the custom booth panels for the new rides"
      },
      "Credits": {
        "title": "Credits:",
        "text": "Made by\n- TisonK (TheCodingDad-TisonK)\n\nBuilt on\n- Co Engine (v0.13.5)\n\nThanks to everyone who kept the queue moving\n\nPark Co · 2026"
      }
    }
  });
