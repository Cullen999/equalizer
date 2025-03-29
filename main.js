

let audio;
async function loadAudio() {
    const response = await fetch("https://cullen999.github.io/equalizer/UltraCyberBass.mp3");
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    audio = document.getElementById("cyberaudio");
    audio.src = url;
    
}

loadAudio();

let animationDuration = 2.0;



document.querySelectorAll('.fader-handle').forEach(handle => {
    let isDragging = false;
    let startTop, startY;
    handle.addEventListener('mousedown', (e) => {
        audio.play();
        isDragging = true;
        startY = e.clientY;
        startTop = parseInt(handle.style.top);
  
    })

    document.addEventListener('mousemove', (e) => {
        if(!isDragging) return;
        const deltaY = e.clientY - startY;
        let newTop = startTop + deltaY;

        newTop = Math.max(0, Math.min(140, newTop));

        handle.style.top = newTop + 'px';

       let spiner = document.querySelectorAll('.vinyl');
       let speedDisplay = document.querySelectorAll('.speed-display');
       let speed = false;

       if(newTop % 7 == 0) {
        speed = 3 - (newTop / 140) * 2;
          // 3.0 - 1.0 = 2.0, и масштабируем на 140px
       }  
       
        
       if(speed) {
        animationDuration = (4 - speed);

       audio.playbackRate = speed; 
       handle.dataset.control == "speedL" ? spiner[0].style.animation = `spin ${animationDuration}s linear infinite` : '';
       handle.dataset.control == "speedL" ? speedDisplay[0].textContent = `Speed: ${speed.toFixed(1)}x` : '';
       handle.dataset.control == "speedR" ? spiner[1].style.animation = `spin ${animationDuration}s linear infinite` : '';
       handle.dataset.control == "speedR" ? speedDisplay[1].textContent = `Speed: ${speed.toFixed(1)}x` : '';
       
       }
    })

    document.addEventListener('mouseup', (e) => {
        isDragging = false;
    })
});



document.querySelectorAll('.vinyl').forEach(vinyl => {
    let isDragging = false
   
    vinyl.addEventListener('mousedown', (e) => {
        isDragging = true;
        if(vinyl.id == "leftVinyl") vinyl.style.animation = `spin 0s linear infinite`;
        if(vinyl.id == "rightVinyl") vinyl.style.animation = `spin 0s linear infinite`;

        audio.pause();
       
    })

    document.addEventListener('mouseup', (e) => {
        if(!isDragging) return;
        vinyl.style.animation = `spin ${animationDuration}s linear infinite`;
        audio.play();
    })
})

const leds = Array.from(document.querySelectorAll(".led-light")).reverse();
let audioContext = null;

function AudioVisualizer() {
        if(audioContext) return;
    
        audioContext = new window.AudioContext();
    
        let src = audioContext.createMediaElementSource(audio);
        let analyser = audioContext.createAnalyser();
        analyser.fftSize = 32;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        src.connect(analyser);
        analyser.connect(audioContext.destination);
    
       
    

    function up() {
        if(!analyser) return;
        analyser.getByteFrequencyData(dataArray);

        let averageVolume = dataArray.reduce((acc, freq) => acc + freq, 0) / bufferLength;
        const lvl = Math.round((averageVolume / 255) * leds.length);

        leds.forEach((light, index) => {
            light.style.opacity = index < lvl ? 1 : 0.2;
        });

        requestAnimationFrame(up);
    }

    audio.onplay = () => {
        if (audioContext.state === "suspended") {
            audioContext.resume();
        }
            up();
        
        
    };
}


function updateVolumeMeter(rotation) {
	const volume = (rotation / 150) * 100;
    
	leds.forEach((led, index) => {
		const ledThreshold = (index + 1) * 10;
		const ledBrightness = Math.min(
			1,
			Math.max(0, (volume - (ledThreshold - 10)) / 10)
		);
		led.style.opacity = 0.1 + ledBrightness * 0.9;
	});
}

document.querySelectorAll('.knob').forEach(knob => {
    
   let startAngle =  Math.atan2(0, 1);
   let rotation = 0;
   let isDragging = false;


   knob.addEventListener('mousedown', (e) => {
        isDragging = true;
        const rect = knob.getBoundingClientRect();
        
		const centerX = rect.left + rect.width / 2;
		const centerY = rect.top + rect.height / 2;
		const currentAngle = Math.atan2( e.clientX - centerX ,-(e.clientY - centerY));
        
        const angleDiff = currentAngle - startAngle;
        
		rotation += angleDiff * (180 / Math.PI);
		rotation = Math.min(150, Math.max(0, rotation));
        
        knob.style.transform = `rotate(${rotation}deg)`;
        startAngle = currentAngle;
		
        if(knob.dataset.control == 'volume') {
            updateVolumeMeter(rotation);
        }

        let vol = rotation / 150;
        
        audio.play();
        audio.volume = vol;
         AudioVisualizer();

   })

   document.addEventListener('mousemove', (e) => {
    if(!isDragging) return;
    
    const rect = knob.getBoundingClientRect();
        
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const currentAngle = Math.atan2( e.clientX - centerX ,-(e.clientY - centerY));
    
    const angleDiff = currentAngle - startAngle;
    
    rotation += angleDiff * (180 / Math.PI);
    console.log(angleDiff * (180 / Math.PI));
    rotation = Math.min(150, Math.max(0, rotation));
    
    
    
    knob.style.transform = `rotate(${rotation}deg)`;
    startAngle = currentAngle;

    if(knob.dataset.control == 'volume') {
        updateVolumeMeter(rotation);
    }

    let vol = rotation / 150;

        audio.play();
        audio.volume = vol;
    
   })

   document.addEventListener('mouseup', () => {
    isDragging = false;
   })

});

