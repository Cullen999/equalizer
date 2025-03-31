const handle = document.querySelectorAll('.fader-handle');
const speedDisplay = document.querySelectorAll('.speed-display');
const speedVinyl = document.querySelectorAll('.vinyl');
const knob = document.querySelectorAll('.knob');
const lights = Array.from(document.querySelectorAll('.led-light')).reverse();
const audio = document.getElementById('audio');

// fader

handle.forEach(handl => {
    let isDragging = false;
    let clientY;
    let startTop = parseInt(handl.style.top);

   

    handl.addEventListener('mousedown', (e) => {
        isDragging = true;
        clientY = e.clientY;
    }) 

    document.addEventListener('mousemove', (e) => {

        // fader move

        if(!isDragging) return;
        
        let distTrav = e.clientY - clientY ;
        clientY = e.clientY;

        startTop = Math.max(0, Math.min(140, startTop + distTrav));

        handl.style.top = `${startTop}px`;

        
        // speed display

        let speedDis = 3 - (startTop * 2 / 140);

        if(handl.dataset.control == 'speedL') speedDisplay[0].textContent = `Speed: ${speedDis.toFixed(1)}x`;
        if(handl.dataset.control == 'speedR') speedDisplay[1].textContent = `Speed: ${speedDis.toFixed(1)}x`;

        // speed vinyl

        let speedVin = 1 + (startTop * 2 / 140)

        if(handl.dataset.control == 'speedL') speedVinyl[0].style.animation = `spin ${speedVin.toFixed(1)}s linear infinite`;
        if(handl.dataset.control == 'speedR') speedVinyl[1].style.animation = `spin ${speedVin.toFixed(1)}s linear infinite`
       
        
    })


    document.addEventListener('mouseup', () => {
        isDragging = false;
    });
});



// knob equalizer


const intervalMap = new Map(); // 


function equalizer(volumeMeter, index, light) {
    let diff = volumeMeter - index;

    if (diff < 0 && diff >= -30) {
            console.log(volumeMeter)
            if (intervalMap.size >= 3) {
                    
                intervalMap.forEach(id => clearInterval(id))
                intervalMap.clear();
                
            }

            if(volumeMeter >= 10 && volumeMeter < 80) {
                let id = setInterval(() => {
                    light.style.opacity = light.style.opacity === "0.1" ? "0.9" : "0.1"; 
                }, diff >= -10 ? 400 : diff >= -20 ? 700 : 900);
                
                intervalMap.set(index, id); 
            } 
            
            
    }
}

// knob 

knob.forEach(knb => {

    let isDragging = false;
    let startAngle = Math.atan2(0, 1) ;
    const rect = knb.getBoundingClientRect();
    const centerY = rect.top + rect.height / 2;
    const centerX = rect.left + rect.width / 2;
    let acc = 0;
    
    knb.addEventListener('mousedown', (e) => {
        // knob down
        
        isDragging = true;

        let radian = Math.atan2(-(centerX - e.clientX), centerY - e.clientY);
        
        let distance = radian - startAngle;
        let gradus = distance * (180 / Math.PI);
        
        acc += gradus;
        startAngle = radian;
        
        if(acc >= 0 && acc <= 153) {
            knb.style.transform = `rotate(${acc}deg)`;

            // volume meter

            if(knb.dataset.control == 'volume') {
                const volumeMeter = acc * 10 / 15;
                let audioVolume = volumeMeter / 100;
                audioVolume > 1.0 ? audioVolume = 1.0 : audioVolume;
                audio.volume = audioVolume;
                audio.play();
                
                lights.forEach((light, i) => {
                    let index = (i + 1) * 10;
                    
                    volumeMeter - index >= 0 ? light.style.opacity = '0.9' : light.style.opacity = '0.0';
                    
                    equalizer(volumeMeter, index, light);
                     
                })
        
            }
        }

    });

        

    document.addEventListener('mousemove', (e) => {
        if(!isDragging) return;

        // knob move
        let radian = Math.atan2(-(centerX - e.clientX), centerY - e.clientY);
        
        let distance = radian - startAngle;
        let gradus = distance * (180 / Math.PI);
        
        acc += gradus;
        startAngle = radian;
        
        if(acc >= 0 && acc <= 153) {
            knb.style.transform = `rotate(${acc}deg)`;

             // volume meter

            if(knb.dataset.control == 'volume') {
                const volumeMeter = acc * 10 / 15;
                
                let audioVolume = volumeMeter / 100;
                audioVolume > 1.0 ? audioVolume = 1.0 : audioVolume;
                audio.volume = audioVolume;
                audio.play();

                lights.forEach((light, i) => {
                    let index = (i + 1) * 10;
                    
                    volumeMeter - index >= 0 ? light.style.opacity = '0.9' : light.style.opacity = '0.0';
    
                    equalizer(volumeMeter, index, light)
                });
        
            }
        }
        
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    })
});



