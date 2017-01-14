var ffmpeg = require('fluent-ffmpeg');
var command = ffmpeg();
var date = new Date();
var ffmpegFile, ffprobeFile;
var request = require('request');
var outputdir;
var os = require("os");

if(process.platform == "win32"){
  ffmpegFile="windows/ffmpeg.exe";
  ffprobeFile="windows/ffprobe.exe";
  outputdir="C:/Users/"+process.env['USERPROFILE'].split(path.sep)[2]+"/Desktop/";
}
else if(process.platform == "darwin"){
  ffmpegFile="mac/ffmpeg";
  ffprobeFile="mac/ffprobe";
  outputdir="/Users/"+os.userInfo().username+"/desktop/";
}
else{
  process.exit();
}


ffmpeg.setFfmpegPath("./ffmpeg/"+ffmpegFile);
ffmpeg.setFfprobePath("./ffmpeg/"+ffprobeFile);

function startRecording(url){
  // check if channel is live.
  request(url, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      // start recording
      command
      .input(url)
      .inputOptions(['-re'])
      .output(outputdir+date.getTime()+'.mp4')
      .audioCodec('libmp3lame')
      .videoCodec('libx264')
      .on('start',function(){
        $('.ripping').css({display:"block"});
        $('.not-ripping').css({display:"none"});
      })
      .on('progress', function(progress) {
        $('.timestamp').text(progress.timemark);
      })
      .on('error', function(err) {
          console.log('An error occurred: ' + err.message);
        })
        .on('end', function() {
          console.log('Merging finished !');
        })
        .run();
    }
    else{
      alert("Channel isn't live.");
    }
  });
}

$(function(){
  $('button[name="rip"]').click(function(){
    var url = "http://iphone-streaming.ustream.tv/uhls/"+$('input[name="channel"]').val()+"/streams/live/iphone/playlist.m3u8";
      startRecording(url);
  });
  $('input[name="directory"]').val(outputdir);
  $('input[name="directory"]').change(()=>{
    outputdir = $(this).val();
  });

  $('button[name="stop"]').click(function(){
    command.kill('SIGINT');
    alert("Stopped Recording.");
    $('.ripping').css({display:"none"});
    $('.not-ripping').css({display:"block"});
    $('.timestamp').text("Loading");

  });
});//17042602

function updateFile(ev){
  alert($(ev).val());
}
