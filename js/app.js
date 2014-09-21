// 2. This code loads the IFrame Player API code asynchronously.
var tag = document.createElement('script');
var done = false;
var firstScriptTag = document.getElementsByTagName('script')[0];
var player;

tag.src = "https://www.youtube.com/iframe_api";
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    height: window.innerHeight,
    width: window.innerWidth,
    videoId: 'M7lc1UVf-VE',
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  });

  document.getElementById('');
}

// 4. The API will call this function when the video player is ready.
function onPlayerReady(event) {
  event.target.playVideo();
}

// 5. The API calls this function when the player's state changes.
//    The function indicates that when playing a video (state=1),
//    the player should play for six seconds and then stop.
function onPlayerStateChange(event) {
  if (event.data == YT.PlayerState.PLAYING && !done) {
    setTimeout(stopVideo, 6000);
    done = true;
  }
}
function stopVideo() {
  player.stopVideo();
}

cast.receiver.logger.setLevelValue(cast.receiver.LoggerLevel.DEBUG);

// Start the system
console.log('Application is ready, starting system');
window.castReceiverManager = cast.receiver.CastReceiverManager.getInstance();
castReceiverManager.onSenderDisconnected = function (event) {
  console.log("sender disconnected");
};

var messageBus = castReceiverManager.getCastMessageBus('urn:x-cast:io.dusq');

messageBus.onMessage = function ( e ) {
  var data = JSON.parse(e.data);

  switch( data.action ) {

    case 'play':
      player.playVideo();
      break;

    case 'pause':
      player.pauseVideo();
      break;

    case 'set_media':
      player.loadVideoById( data.id );
      break;
  }
};
// The default inactivity is normally 10 seconds, since we are encouraging you
// to debug this receiver, we are setting it to 10 minutes. As setting a break
// point might inadvertently trigger a timeout. The purpose of the timer is to
// speed the recognition of disconnection of a sender.  As the TCP/IP standard
// mechanisms can be quite slow.
castReceiverManager.start({maxInactivity: 600});
