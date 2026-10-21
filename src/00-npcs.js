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
            "to": "midway"
          },
          {
            "do": "wander",
            "radius": 4,
            "seconds": 8
          },
          {
            "do": "walk",
            "to": "carousel"
          },
          {
            "do": "wander",
            "radius": 5,
            "seconds": 12
          },
          {
            "do": "walk",
            "to": "fairCross"
          },
          {
            "do": "walk",
            "to": "teacups"
          },
          {
            "do": "wander",
            "radius": 5,
            "seconds": 10
          },
          {
            "do": "walk",
            "to": "kidsLane"
          },
          {
            "do": "wander",
            "radius": 5,
            "seconds": 14
          },
          {
            "do": "say",
            "text": "Look at the little train!"
          },
          {
            "do": "walk",
            "to": "snack"
          },
          {
            "do": "wander",
            "radius": 3,
            "seconds": 6
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
            "to": "midway"
          },
          {
            "do": "wander",
            "radius": 4,
            "seconds": 8
          },
          {
            "do": "walk",
            "to": "ferris"
          },
          {
            "do": "wander",
            "radius": 5,
            "seconds": 10
          },
          {
            "do": "walk",
            "to": "thrillCross"
          },
          {
            "do": "walk",
            "to": "dodgems"
          },
          {
            "do": "wander",
            "radius": 5,
            "seconds": 14
          },
          {
            "do": "face",
            "to": "baron"
          },
          {
            "do": "wait",
            "seconds": 6
          },
          {
            "do": "walk",
            "to": "station"
          },
          {
            "do": "wander",
            "radius": 3,
            "seconds": 6
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
            "to": "fairCross"
          },
          {
            "do": "wander",
            "radius": 3,
            "seconds": 4
          },
          {
            "do": "walk",
            "to": "darkWoods"
          },
          {
            "do": "wander",
            "radius": 5,
            "seconds": 14
          },
          {
            "do": "walk",
            "to": "dropTower"
          },
          {
            "do": "wander",
            "radius": 5,
            "seconds": 10
          },
          {
            "do": "walk",
            "to": "promWest"
          },
          {
            "do": "walk",
            "to": "halls"
          },
          {
            "do": "wander",
            "radius": 5,
            "seconds": 12
          },
          {
            "do": "say",
            "text": "Such a nice little park."
          },
          {
            "do": "walk",
            "to": "gardenWalk"
          },
          {
            "do": "wander",
            "radius": 5,
            "seconds": 10
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
      "visitorD": {
        "names": [
          "Lars",
          "Julia",
          "Bas",
          "Roos",
          "Milan",
          "Fleur"
        ],
        "look": {
          "shirt": "#7a4a8a",
          "pants": "#2b2f36",
          "skin": "#e2b48a",
          "hair": "#4a2f1c"
        },
        "speed": 1.45,
        "steps": [
          {
            "do": "walk",
            "to": "thrillCross"
          },
          {
            "do": "wander",
            "radius": 3,
            "seconds": 4
          },
          {
            "do": "walk",
            "to": "coasterCountry"
          },
          {
            "do": "wander",
            "radius": 5,
            "seconds": 12
          },
          {
            "do": "walk",
            "to": "promEast"
          },
          {
            "do": "walk",
            "to": "eastWalk"
          },
          {
            "do": "wander",
            "radius": 5,
            "seconds": 10
          },
          {
            "do": "walk",
            "to": "firebird"
          },
          {
            "do": "wander",
            "radius": 5,
            "seconds": 12
          },
          {
            "do": "face",
            "to": "firebirdTrack"
          },
          {
            "do": "wait",
            "seconds": 8
          },
          {
            "do": "walk",
            "to": "dragon"
          },
          {
            "do": "wander",
            "radius": 5,
            "seconds": 12
          },
          {
            "do": "say",
            "text": "That loop!"
          },
          {
            "do": "walk",
            "to": "promEast"
          },
          {
            "do": "wander",
            "radius": 5,
            "seconds": 6
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
      "visitorE": {
        "names": [
          "Wim",
          "Ellen",
          "Jan",
          "Ilse",
          "Koen",
          "Maud"
        ],
        "look": {
          "shirt": "#c9a227",
          "pants": "#3a3f48",
          "skin": "#d39a72",
          "hair": "#8a6a4a"
        },
        "speed": 1.2,
        "steps": [
          {
            "do": "walk",
            "to": "fairCross"
          },
          {
            "do": "wander",
            "radius": 3,
            "seconds": 4
          },
          {
            "do": "walk",
            "to": "gardenWest"
          },
          {
            "do": "wander",
            "radius": 5,
            "seconds": 8
          },
          {
            "do": "walk",
            "to": "gardenWalk"
          },
          {
            "do": "wander",
            "radius": 5,
            "seconds": 12
          },
          {
            "do": "walk",
            "to": "clock"
          },
          {
            "do": "wander",
            "radius": 5,
            "seconds": 14
          },
          {
            "do": "walk",
            "to": "bandstand"
          },
          {
            "do": "wander",
            "radius": 5,
            "seconds": 16
          },
          {
            "do": "walk",
            "to": "maze"
          },
          {
            "do": "wander",
            "radius": 5,
            "seconds": 10
          },
          {
            "do": "walk",
            "to": "promWest"
          },
          {
            "do": "wander",
            "radius": 5,
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
      "sweeperNorth": {
        "names": [
          "Joop"
        ],
        "look": {
          "shirt": "#e0a92c",
          "pants": "#2f3440",
          "skin": "#c99266",
          "hair": "#3a3a3a"
        },
        "speed": 1.1,
        "steps": [
          {
            "do": "walk",
            "to": "gardenWalk"
          },
          {
            "do": "wander",
            "radius": 9,
            "seconds": 30
          },
          {
            "do": "walk",
            "to": "promWest"
          },
          {
            "do": "wander",
            "radius": 8,
            "seconds": 25
          },
          {
            "do": "walk",
            "to": "promEast"
          },
          {
            "do": "wander",
            "radius": 8,
            "seconds": 25
          }
        ]
      },
      "gardener": {
        "names": [
          "Truus"
        ],
        "look": {
          "shirt": "#4d7a3a",
          "pants": "#3a2f24",
          "skin": "#e0b48e",
          "hair": "#b8b8b8"
        },
        "speed": 1,
        "steps": [
          {
            "do": "walk",
            "to": "clock"
          },
          {
            "do": "wander",
            "radius": 6,
            "seconds": 40
          },
          {
            "do": "walk",
            "to": "maze"
          },
          {
            "do": "wander",
            "radius": 5,
            "seconds": 30
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
        "max": 6,
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
        "every": 15,
        "max": 5,
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
        "every": 17,
        "max": 5,
        "hours": [
          9,
          22
        ]
      },
      {
        "id": "crowdD",
        "character": "visitorD",
        "x": 3,
        "z": 24,
        "every": 17,
        "max": 5,
        "hours": [
          9,
          22
        ]
      },
      {
        "id": "crowdE",
        "character": "visitorE",
        "x": -3,
        "z": 24,
        "every": 19,
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
        "id": "sweeperNorth",
        "character": "sweeperNorth",
        "x": 2,
        "z": -44,
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
        "id": "gardener",
        "character": "gardener",
        "x": 4,
        "z": -58,
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
      "gate": {
        "x": 0,
        "z": 28
      },
      "midway": {
        "x": 0,
        "z": 14
      },
      "station": {
        "x": 0,
        "z": 4
      },
      "coaster": {
        "x": 0,
        "z": -2
      },
      "snack": {
        "x": -11,
        "z": 9
      },
      "carousel": {
        "x": -14,
        "z": 19
      },
      "ferris": {
        "x": 13,
        "z": 19
      },
      "fairCross": {
        "x": -31,
        "z": 3
      },
      "teacups": {
        "x": -40,
        "z": 3
      },
      "kidsLane": {
        "x": -46.8,
        "z": 36
      },
      "thrillCross": {
        "x": 35,
        "z": 3
      },
      "dodgems": {
        "x": 42,
        "z": 3
      },
      "baron": {
        "x": 57,
        "z": 19
      },
      "darkWoods": {
        "x": -36,
        "z": -24
      },
      "dropTower": {
        "x": -36,
        "z": -52
      },
      "promWest": {
        "x": -20,
        "z": -60
      },
      "halls": {
        "x": -46.5,
        "z": -70
      },
      "gardenWest": {
        "x": -28,
        "z": -44
      },
      "gardenWalk": {
        "x": 2,
        "z": -44
      },
      "clock": {
        "x": 6,
        "z": -58
      },
      "bandstand": {
        "x": 2,
        "z": -66
      },
      "maze": {
        "x": 9.5,
        "z": -72
      },
      "coasterCountry": {
        "x": 40,
        "z": -24
      },
      "promEast": {
        "x": 50,
        "z": -60
      },
      "eastWalk": {
        "x": 76,
        "z": -20
      },
      "firebird": {
        "x": 77,
        "z": -36
      },
      "firebirdTrack": {
        "x": 100,
        "z": -30
      },
      "dragon": {
        "x": 77,
        "z": -92
      }
    }
  });
