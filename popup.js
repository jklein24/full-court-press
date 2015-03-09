window.onload = function() {
  chrome.runtime.sendMessage({'type': 'getMatchup'}, parseAndShowScore);
}



function parseAndShowScore(matchup) {
  var table = document.createElement('table');
  var teams = matchup[0].teams;
  var row = document.createElement('tr');
  var statNameCell = document.createElement('th');
  row.appendChild(statNameCell);

  for (var statKey in STAT_MAP) {
    if (statKey > 20) {
      continue;
    }
    statNameCell = document.createElement('th');
    statNameCell.textContent = STAT_MAP[statKey];
    row.appendChild(statNameCell);
  }

  table.appendChild(row);

  var logo;
  for (var i = 0; i < teams.count; i++) {
    row = document.createElement('tr');
    var team = teams[i];

    var name = team.team[0][2].name;
    nameCell = document.createElement('td');
    logo = document.createElement('img');
    logo.src = team.team[0][5].team_logos[0].team_logo.url;
    nameCell.appendChild(logo);
    var nameTextCell = document.createElement('div');
    nameTextCell.textContent = name;
    nameCell.appendChild(nameTextCell);
    row.appendChild(nameCell);

    var stats = team.team[1].team_stats.stats;
    for (var j = 0;j < stats.length; j++) {
      var statId = stats[j].stat.stat_id;
      if (statId > 20) {
        continue;
      }

      var statValue = stats[j].stat.value;
      var statCell = document.createElement('td');
      statCell.textContent = statValue | '0';
      row.appendChild(statCell);
    }
    table.appendChild(row);
  }
  document.body.appendChild(table);
}

var STAT_MAP = {
  9004003: "FG Ratio",
  5: "FG%",
  9007006: "FT Ratio",
  8: "FT%",
  10: "3PTM",
  12: "PTS",
  15: "REB",
  16: "AST",
  17: "ST",
  18: "BLK",
  19: "TO"
}
