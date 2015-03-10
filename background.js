var consumerKey = 'dj0yJmk9emlsSzRJbkMyRkVqJmQ9WVdrOVVFNVlSMk5LTkhFbWNHbzlNQS0tJnM9Y29uc3VtZXJzZWNyZXQmeD1jYw--';
var consumerSecret = '5dc75d63ba1e6be664c4792631798c565acb189b';
var redirectUri = chrome.identity.getRedirectURL('provider_cb');
var redirectRe = new RegExp(redirectUri + '[#\?](.*)');
var oauthToken = '';
var yid = '';
var leagueId;


chrome.runtime.onInstalled.addListener(function() {
  requestToken();
});

function requestToken(opt_callback) {
  var options = {
    'interactive': true,
    'url': 'https://api.login.yahoo.com/oauth2/request_auth?client_id=' + consumerKey +
        '&response_type=token&redirect_uri=' + encodeURIComponent(redirectUri)
  };
  chrome.identity.launchWebAuthFlow(
  options, function(redirect_url) {
    oauthToken = getParameterByName(redirect_url, 'access_token');
    yid = getParameterByName(redirect_url, 'xoauth_yahoo_guid');

    chrome.storage.local.set({'fcp.oauth': oauthToken, 'fcp.yid': yid});
    if (opt_callback) {
      opt_callback();
    }
  });
}

function makeRequest(url, callback) {
  if (!oauthToken) {
    chrome.storage.local.get('fcp.oauth', function(token) {
      oauthToken = token;
      if (!oauthToken) {
        requestToken(makeRequest.bind(this, url, callback));
      } else {
        makeRequest(url, callback);
      }
    });
    return;
  }

  $.ajax({
      type: 'GET',
      url: url,
      headers: {
        'Authorization': 'Bearer ' + oauthToken,
      },
      statusCode: {
        401: function() {
          requestToken(makeRequest.bind(this, url, callback));
        }
      }
    }).done(function( msg ) {
      callback(msg)
    });
}

function getUserLeagueId(callback) {
  makeRequest(
    'https://fantasysports.yahooapis.com/fantasy/v2/users;use_login=1/games;game_keys=342/leagues?format=json',
    function(response) {
      leagueId = response.fantasy_content.users[0].user[1].games[0].game[1].leagues[0].league[0].league_id;
      callback();
    });
}

function getScoreboard(opt_callback) {
  makeRequest(
    'https://fantasysports.yahooapis.com/fantasy/v2/league/342.l.' + leagueId + '/scoreboard?format=json',
    function(response) {
      var scoreboard = response.fantasy_content.league[1].scoreboard;
      if (opt_callback) {
        if (!yid) {
          chrome.storage.local.get('fcp.yid', function(guid) {
            yid = guid;
            getScoreboard(opt_callback);
          });
          return;
        }

        opt_callback(findMyMatchup(scoreboard));
      }
    });
}

function findMyMatchup(scoreboard) {
  var matchups = scoreboard[0].matchups;
  for (var i = 0; i < matchups.count; i++) {
    var manGuid1 = matchups[i].matchup[0].teams[0].team[0][13].managers[0].manager.guid;
    var manGuid2 = matchups[i].matchup[0].teams[1].team[0][13].managers[0].manager.guid;
    if (manGuid1 == yid || manGuid2 == yid) {
      return matchups[i].matchup;
    }
  }
}

chrome.runtime.onMessage.addListener(function(msg, sender, callback) {
  if (msg.type == "getMatchup") {
    if (!leagueId) {
      getUserLeagueId(getScoreboard.bind(this, callback));
    } else {
      getScoreboard(callback);
    }
  }
  return true;
});

function getParameterByName(response, name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&#]" + name + "=([^&#]*)"),
        results = regex.exec(response);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}
