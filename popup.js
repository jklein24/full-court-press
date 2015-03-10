window.onload = function() {
  chrome.runtime.sendMessage({'type': 'getMatchup'}, parseAndShowScore);
}

function parseAndShowScore(matchup) {
  var table = document.createElement('table');
  addHeaders(table, getLeagueId(matchup));
  var teams = matchup[0].teams;

  for (var i = 0; i < teams.count; i++) {
    row = document.createElement('tr');
    var team = teams[i];

    addNameCell(team, row);
    addStatCells(team, teams[(i+1)%2], row);

    table.appendChild(row);
  }
  document.body.appendChild(table);
}

function addHeaders(table, leagueId) {
  var row = document.createElement('tr');
  var statNameCell = document.createElement('th');
  var trackerLink = document.createElement('a');
  trackerLink.target = "_blank";
  trackerLink.href = 'http://sports.yahoo.com/nba/gamechannel?app=st&lid=' +
      leagueId + '&type=nba';
  trackerLink.innerHTML = '&#8689; Tracker';
  statNameCell.appendChild(trackerLink);
  row.appendChild(statNameCell);

  for (var statKey in STAT_MAP) {
    if (statKey > 20) {
      continue;
    }
    statNameCell = document.createElement('th');
    statNameCell.textContent = STAT_MAP[statKey];
    row.appendChild(statNameCell);
  }

  var scoreNameCell = document.createElement('th');
  scoreNameCell.textContent = 'Score';
  row.appendChild(scoreNameCell);

  table.appendChild(row);
}

function addNameCell(team, row) {
  var name = team.team[0][2].name;
  var nameCell = document.createElement('td');
  var teamUrl = team.team[0][4].url;
  var link = document.createElement('a');
  link.target = "_blank";
  link.href = teamUrl;
  nameCell.appendChild(link);
  var logo = document.createElement('img');
  logo.src = team.team[0][5].team_logos[0].team_logo.url;
  link.appendChild(logo);
  var nameTextCell = document.createElement('div');
  nameTextCell.textContent = name;
  link.appendChild(nameTextCell);
  row.appendChild(nameCell);
}

function addStatCells(team, otherTeam, row) {
  var stats = team.team[1].team_stats.stats;
  var otherTeamStats = otherTeam.team[1].team_stats.stats;
  for (var j = 0;j < stats.length; j++) {
    var statId = stats[j].stat.stat_id;
    if (statId > 20) {
      continue;
    }

    var statValue = stats[j].stat.value;
    var statCell = document.createElement('td');
    statCell.classList.add('stat-cell');
    var otherTeamStatValue = otherTeamStats[j].stat.value;
    var compareClass = (statValue > otherTeamStatValue && statId != 19 ||
        statValue < otherTeamStatValue && statId == 19) ?
        'more-stat' : 'less-stat';
    statCell.classList.add(compareClass);
    statCell.textContent = statValue || '0';
    row.appendChild(statCell);
  }

  var pointsCell = document.createElement('td');
  pointsCell.classList.add('points-cell');
  pointsCell.textContent = team.team[1].team_points.total;
  row.appendChild(pointsCell);
}

function getLeagueId(matchup) {
  var teamKey = matchup[0].teams[0].team[0][0].team_key;
  return teamKey.substr(6, teamKey.substr(6).indexOf("."));
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
