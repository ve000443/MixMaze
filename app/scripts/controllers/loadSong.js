'use strict';

angular.module('frontEndApp')
  .controller('LoadSongCtrl', function ($http, $rootScope) {

    /**
     * CONNECTION WITH MONGO DB API
     */
    $http.get("http://xythe.xyz:8080/musics").then(

      function successCallback(response){
        console.log(response.data);
        $rootScope.musics = response.data;
        $rootScope.musics.forEach(function(o){
          console.log(o.musicPath + o.musicFiles[0].file);
        });

        // this callback will be called asynchronously
        // when the response is available
      }, function errorCallback(response) {
        console.error;
        // called asynchronously if an error occurs
        // or server returns response with an error status
    });

    var vm = this;

    var bufferLoader;
    var ctx;

    var listOfSoundSamplesURLs = [
      'http://5.39.81.217/mixmaze/musics/DireStraits/voix.mp3',
      'http://5.39.81.217/mixmaze/musics/DireStraits/guitare.mp3'
    ];

    this.loadSamples = function(){
      // To make it work even on browsers like Safari, that still
      // do not recognize the non prefixed version of AudioContext
      var audioContext = window.AudioContext || window.webkitAudioContext;

      ctx = new audioContext();

      loadAllSoundSamples();
    };

    function playSampleNormal(buffer){
      var bufferSource = ctx.createBufferSource();
      bufferSource.buffer = buffer;
      bufferSource.connect(ctx.destination);
      bufferSource.start();
    }


    function onSamplesDecoded(buffers){
      console.log("all samples loaded and decoded");
      shot1Normal.disabled=false;
      shot2Normal.disabled=false;

      shot1Normal.onclick = function(evt) {
        playSampleNormal(buffers[0]);
      };

      shot2Normal.onclick = function(evt) {
        playSampleNormal(buffers[1]);
      };
    }

    function loadAllSoundSamples() {
      // onSamplesDecoded will be called when all samples
      // have been loaded and decoded, and the decoded sample will
      // be its only parameter (see function above)
      bufferLoader = new BufferLoader(
        ctx,
        listOfSoundSamplesURLs,
        onSamplesDecoded
      );

      // start loading and decoding the files
      bufferLoader.load();
    }

// You do not have to understand in details the next lines of code...
// just use them!

    /* ############################
     BUFFER LOADER for loading multiple files asyncrhonously. The callback functions is called when all
     files have been loaded and decoded
     ############################## */
    function BufferLoader(context, urlList, callback) {
      this.context = context;
      this.urlList = urlList;
      this.callback = callback;
      this.bufferList = [];
      this.loadCount = 0;
    }

    BufferLoader.prototype.loadBuffer = function(url, index) {
      // Load buffer asynchronously
      console.log('file : ' + url + "loading and decoding");

      var request = new XMLHttpRequest();
      request.open("GET", url, true);

      request.responseType = "arraybuffer";

      var loader = this;

      request.onload = function() {

        // Asynchronously decode the audio file data in request.response
        loader.context.decodeAudioData(
          request.response,
          function(buffer) {
            console.log("Loaded and decoded track " + (loader.loadCount+1) +
              "/" +  loader.urlList.length + "...");

            if (!buffer) {
              alert('error decoding file data: ' + url);
              return;
            }
            loader.bufferList[index] = buffer;

            //console.log("In bufferLoader.onload bufferList size is " + loader.bufferList.length + " index =" + index);
            if (++loader.loadCount == loader.urlList.length)
            // call the callback and pass it the decoded buffers, we've finihed
              loader.callback(loader.bufferList);

            vm.init(buffer, canvas1, 'black');
            // First parameter = Y position (top left corner)
            // second = height of the sample drawing
            vm.drawWave(0, canvas1.height);
          },
          function(error) {
            console.error('decodeAudioData error', error);
          }
        );
      };

      request.onprogress = function(e) {
        if(e.total !== 0) {
          var percent = (e.loaded * 100) / e.total;

          console.log("loaded " + percent  + " % of file " + index);
        }
      };

      request.onerror = function() {
        alert('BufferLoader: XHR error');
      };

      request.send();
    };

    BufferLoader.prototype.load = function() {
      console.log("Loading " + this.urlList.length + "track(s)... please wait...");
      for (var i = 0; i < this.urlList.length; ++i)
        this.loadBuffer(this.urlList[i], i);
    };

    this.decodedAudioBuffer;
    this.peaks;
    this.canvas;
    this.displayWidth;
    this.displayHeight;
    this.sampleStep =  10;
    this.color = 'black';
    //test

    this.init = function(decodedAudioBuffer, canvas, color) {
      this.decodedAudioBuffer = decodedAudioBuffer;
      this.canvas = canvas;
      this.displayWidth = canvas.width;
      this.displayHeight = canvas.height;
      this.color = color;
      //this.sampleStep = sampleStep;

      // Initialize the peaks array from the decoded audio buffer and canvas size
      this.getPeaks();
    }

    this.max = function max(values) {
      var max = -Infinity;
      for (var i = 0, len = values.length; i < len; i++) {
        var val = values[i];
        if (val > max) { max = val; }
      }
      return max;
    }
    // Fist parameter : wjere to start vertically in the canvas (useful when we draw several
    // waveforms in a single canvas)
    // Second parameter = height of the sample
    this.drawWave = function(startY, height) {
      var ctx = this.canvas.getContext('2d');
      ctx.save();
      ctx.translate(0, startY);

      ctx.fillStyle = this.color;
      ctx.strokeStyle = this.color;

      var width = this.displayWidth;
      var coef = height / (2 * this.max(this.peaks));
      var halfH = height / 2;

      ctx.beginPath();
      ctx.moveTo(0, halfH);
      ctx.lineTo(width, halfH);
      console.log("drawing from 0, " + halfH + " to " + width + ", " + halfH);
      ctx.stroke();


      ctx.beginPath();
      ctx.moveTo(0, halfH);

      for (var i = 0; i < width; i++) {
        var h = Math.round(this.peaks[i] * coef);
        ctx.lineTo(i, halfH + h);
      }
      ctx.lineTo(width, halfH);

      ctx.moveTo(0, halfH);

      for (var i = 0; i < width; i++) {
        var h = Math.round(this.peaks[i] * coef);
        ctx.lineTo(i, halfH - h);
      }

      ctx.lineTo(width, halfH);

      ctx.fill();

      ctx.restore();
    }

    // Builds an array of peaks for drawing
    // Need the decoded buffer
    // Note that we go first through all the sample data and then
    // compute the value for a given column in the canvas, not the reverse
    // A sampleStep value is used in order not to look each indivudal sample
    // value as they are about 15 millions of samples in a 3mn song !
    this.getPeaks = function() {
      var buffer = this.decodedAudioBuffer;
      var sampleSize = Math.ceil(buffer.length / this.displayWidth);

      console.log("sample size = " + buffer.length);

      this.sampleStep = this.sampleStep || ~~(sampleSize / 10);

      var channels = buffer.numberOfChannels;
      // The result is an array of size equal to the displayWidth
      this.peaks = new Float32Array(this.displayWidth);

      // For each channel
      for (var c = 0; c < channels; c++) {
        var chan = buffer.getChannelData(c);

        for (var i = 0; i < this.displayWidth; i++) {
          var start = ~~(i * sampleSize);
          var end = start + sampleSize;
          var peak = 0;
          for (var j = start; j < end; j += this.sampleStep) {
            var value = chan[j];
            if (value > peak) {
              peak = value;
            } else if (-value > peak) {
              peak = -value;
            }
          }
          if (c > 1) {
            this.peaks[i] += peak / channels;
          } else {
            this.peaks[i] = peak / channels;
          }
        }
      }
    }



  });
