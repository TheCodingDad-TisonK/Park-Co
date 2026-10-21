//@ the NPCs the editor saved: characters and what they do, their spawners, the workers and the spots they go to, as data. Written by the Co Engine editor; it sorts first in src/. Edit it in the editor rather than here.
  CO.npcs({
    "characters": {
      "visitorA": {
        "names": [
          "Anna",
          "Bram",
          "Sanne",
          "Daan",
          "Lotte",
          "Sem"
        ],
        "look": {
          "shirt": "#3f6a9e",
          "pants": "#2f3440",
          "skin": "#d8a97c",
          "hair": "#3a2a1c"
        },
        "speed": 1.35,
        "steps": [
          {
            "do": "walk",
            "to": "plaza"
          },
          {
            "do": "wander",
            "radius": 6,
            "seconds": 12
          },
          {
            "do": "walk",
            "to": "midway"
          },
          {
            "do": "wander",
            "radius": 4,
            "seconds": 10
          },
          {
            "do": "walk",
            "to": "station"
          },
          {
            "do": "wait",
            "seconds": 6
          },
          {
            "do": "walk",
            "to": "snack"
          },
          {
            "do": "wait",
            "seconds": 4
          },
          {
            "do": "walk",
            "to": "plaza"
          },
          {
            "do": "leave"
          }
        ]
      },
      "visitorB": {
        "names": [
          "Femke",
          "Thijs",
          "Noor",
          "Jesse",
          "Mila",
          "Ruben"
        ],
        "look": {
          "shirt": "#a8462f",
          "pants": "#3a3f48",
          "skin": "#e8c49b",
          "hair": "#6b4a2a"
        },
        "speed": 1.28,
        "steps": [
          {
            "do": "walk",
            "to": "plaza"
          },
          {
            "do": "walk",
            "to": "carousel"
          },
          {
            "do": "wander",
            "radius": 5,
            "seconds": 14
          },
          {
            "do": "walk",
            "to": "midway"
          },
          {
            "do": "wander",
            "radius": 5,
            "seconds": 10
          },
          {
            "do": "walk",
            "to": "ferris"
          },
          {
            "do": "wait",
            "seconds": 5
          },
          {
            "do": "walk",
            "to": "plaza"
          },
          {
            "do": "leave"
          }
        ]
      },
      "visitorC": {
        "names": [
          "Omar",
          "Yara",
          "Sven",
          "Iris",
          "Timo",
          "Eva"
        ],
        "look": {
          "shirt": "#5b8a52",
          "pants": "#2d333b",
          "skin": "#c99266",
          "hair": "#1e1712"
        },
        "speed": 1.42,
        "steps": [
          {
            "do": "walk",
            "to": "midway"
          },
          {
            "do": "wander",
            "radius": 7,
            "seconds": 16
          },
          {
            "do": "say",
            "text": "Such a nice little park."
          },
          {
            "do": "walk",
            "to": "teacups"
          },
          {
            "do": "wander",
            "radius": 4,
            "seconds": 8
          },
          {
            "do": "walk",
            "to": "plaza"
          },
          {
            "do": "leave"
          }
        ]
      },
      "sweeper": {
        "names": [
          "Piet"
        ],
        "look": {
          "shirt": "#e0a92c",
          "pants": "#2f3440",
          "skin": "#d8a97c",
          "hair": "#5a5a5a"
        },
        "speed": 1.1,
        "steps": [
          {
            "do": "walk",
            "to": "midway"
          },
          {
            "do": "wander",
            "radius": 9,
            "seconds": 25
          },
          {
            "do": "walk",
            "to": "plaza"
          },
          {
            "do": "wander",
            "radius": 6,
            "seconds": 20
          },
          {
            "do": "walk",
            "to": "snack"
          },
          {
            "do": "wander",
            "radius": 5,
            "seconds": 18
          }
        ]
      },
      "watcher": {
        "names": [
          "Kees"
        ],
        "look": {
          "shirt": "#4a5a6a",
          "pants": "#2f3440",
          "skin": "#e0b48e",
          "hair": "#2a2a2a"
        },
        "speed": 1.05,
        "steps": [
          {
            "do": "walk",
            "to": "station"
          },
          {
            "do": "face",
            "to": "coaster"
          },
          {
            "do": "wait",
            "seconds": 40
          },
          {
            "do": "walk",
            "to": "ferris"
          },
          {
            "do": "wait",
            "seconds": 30
          },
          {
            "do": "walk",
            "to": "carousel"
          },
          {
            "do": "wait",
            "seconds": 30
          }
        ]
      }
    },
    "spawners": [
      {
        "id": "crowdA",
        "character": "visitorA",
        "x": -5,
        "z": 26,
        "every": 13,
        "max": 5,
        "hours": [
          9,
          22
        ]
      },
      {
        "id": "crowdB",
        "character": "visitorB",
        "x": 5,
        "z": 26,
        "every": 17,
        "max": 4,
        "hours": [
          9,
          22
        ]
      },
      {
        "id": "crowdC",
        "character": "visitorC",
        "x": 0,
        "z": 24,
        "every": 21,
        "max": 4,
        "hours": [
          9,
          22
        ]
      }
    ],
    "workers": [
      {
        "id": "sweeper",
        "character": "sweeper",
        "x": 0,
        "z": 20,
        "ry": 0,
        "home": [
          0,
          24
        ],
        "hours": [
          9,
          22
        ]
      },
      {
        "id": "watcher",
        "character": "watcher",
        "x": 0,
        "z": 2,
        "ry": 3.141592653589793,
        "home": [
          0,
          24
        ],
        "hours": [
          9,
          22
        ]
      }
    ],
    "spots": {
      "plaza": {
        "x": 0,
        "z": 26
      },
      "midway": {
        "x": 0,
        "z": 14
      },
      "station": {
        "x": 0,
        "z": 4
      },
      "snack": {
        "x": -11,
        "z": 9
      },
      "carousel": {
        "x": -14,
        "z": 19
      },
      "teacups": {
        "x": -14,
        "z": 3
      },
      "ferris": {
        "x": 13,
        "z": 19
      },
      "coaster": {
        "x": 0,
        "z": -2
      },
      "gate": {
        "x": 0,
        "z": 28
      }
    }
  });
