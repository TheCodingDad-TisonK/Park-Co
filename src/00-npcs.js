//@ the NPCs the editor saved: characters and what they do, their spawners, the workers and the spots they go to, as data. Written by the Co Engine editor; it sorts first in src/. Edit it in the editor rather than here.
  CO.npcs({
    "characters": {
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
      "guardSouth": {
        "names": [
          "Marco"
        ],
        "look": {
          "shirt": "#23324a",
          "pants": "#1b2230",
          "skin": "#d8a97c",
          "hair": "#2a2a2a"
        },
        "speed": 1.15,
        "steps": [
          {
            "do": "walk",
            "to": "plaza"
          },
          {
            "do": "wait",
            "seconds": 10
          },
          {
            "do": "walk",
            "to": "midway"
          },
          {
            "do": "wander",
            "radius": 3,
            "seconds": 10
          },
          {
            "do": "walk",
            "to": "fairCross"
          },
          {
            "do": "wait",
            "seconds": 6
          },
          {
            "do": "walk",
            "to": "teacups"
          },
          {
            "do": "wait",
            "seconds": 8
          },
          {
            "do": "walk",
            "to": "fairCross"
          },
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
            "seconds": 8
          },
          {
            "do": "walk",
            "to": "thrillCross"
          },
          {
            "do": "wait",
            "seconds": 6
          },
          {
            "do": "walk",
            "to": "dodgems"
          },
          {
            "do": "wait",
            "seconds": 8
          },
          {
            "do": "walk",
            "to": "thrillCross"
          },
          {
            "do": "walk",
            "to": "midway"
          }
        ]
      },
      "guardNorth": {
        "names": [
          "Ingrid"
        ],
        "look": {
          "shirt": "#23324a",
          "pants": "#1b2230",
          "skin": "#d8a97c",
          "hair": "#2a2a2a"
        },
        "speed": 1.15,
        "steps": [
          {
            "do": "walk",
            "to": "gardenWalk"
          },
          {
            "do": "wait",
            "seconds": 8
          },
          {
            "do": "walk",
            "to": "darkWoods"
          },
          {
            "do": "wait",
            "seconds": 6
          },
          {
            "do": "walk",
            "to": "dropTower"
          },
          {
            "do": "wait",
            "seconds": 6
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
            "do": "wait",
            "seconds": 8
          },
          {
            "do": "walk",
            "to": "promWest"
          },
          {
            "do": "walk",
            "to": "bandstand"
          },
          {
            "do": "wait",
            "seconds": 6
          },
          {
            "do": "walk",
            "to": "promEast"
          },
          {
            "do": "walk",
            "to": "coasterCountry"
          },
          {
            "do": "wait",
            "seconds": 6
          },
          {
            "do": "walk",
            "to": "eastWalk"
          },
          {
            "do": "walk",
            "to": "firebird"
          },
          {
            "do": "wait",
            "seconds": 6
          },
          {
            "do": "walk",
            "to": "dragon"
          },
          {
            "do": "wait",
            "seconds": 8
          },
          {
            "do": "walk",
            "to": "promEast"
          },
          {
            "do": "walk",
            "to": "gardenWalk"
          }
        ]
      },
      "guardGate": {
        "names": [
          "Henk"
        ],
        "look": {
          "shirt": "#23324a",
          "pants": "#1b2230",
          "skin": "#d8a97c",
          "hair": "#2a2a2a"
        },
        "speed": 1,
        "steps": [
          {
            "do": "walk",
            "to": "post"
          },
          {
            "do": "face",
            "to": "lotDrive"
          },
          {
            "do": "wait",
            "seconds": 60
          }
        ]
      },
      "cashierWest": {
        "names": [
          "Sophie"
        ],
        "look": {
          "shirt": "#b8362b",
          "pants": "#2f3440",
          "skin": "#e8c49b",
          "hair": "#6b4a2a"
        },
        "speed": 1.2,
        "steps": [
          {
            "do": "walk",
            "to": "post"
          },
          {
            "do": "wait",
            "seconds": 120
          }
        ]
      },
      "cashierEast": {
        "names": [
          "Tom"
        ],
        "look": {
          "shirt": "#b8362b",
          "pants": "#2f3440",
          "skin": "#e8c49b",
          "hair": "#6b4a2a"
        },
        "speed": 1.2,
        "steps": [
          {
            "do": "walk",
            "to": "post"
          },
          {
            "do": "wait",
            "seconds": 120
          }
        ]
      }
    },
    "spawners": [],
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
        "id": "guardSouth",
        "character": "guardSouth",
        "x": 0,
        "z": 26,
        "ry": 0,
        "home": [
          0,
          24
        ],
        "hours": [
          8.5,
          22.5
        ]
      },
      {
        "id": "guardNorth",
        "character": "guardNorth",
        "x": 2,
        "z": -44,
        "ry": 0,
        "home": [
          0,
          24
        ],
        "hours": [
          8.5,
          22.5
        ]
      },
      {
        "id": "guardGate",
        "character": "guardGate",
        "x": -4.6,
        "z": 71.7,
        "ry": 1.5707963267948966,
        "home": [
          -16.6,
          42.5
        ],
        "hours": [
          7.5,
          23
        ]
      },
      {
        "id": "cashierWest",
        "character": "cashierWest",
        "x": -9.55,
        "z": 36.8,
        "ry": 0,
        "off": true
      },
      {
        "id": "cashierEast",
        "character": "cashierEast",
        "x": 8.45,
        "z": 36.8,
        "ry": 0,
        "off": true
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
      "dragon": {
        "x": 77,
        "z": -92
      },
      "lotDrive": {
        "x": 0,
        "z": 74
      }
    }
  });
