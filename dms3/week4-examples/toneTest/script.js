/* find modal close button and add an eventlistener */
document.getElementById("dialogCloseBtn").addEventListener("click", () => {
  document.getElementById("introDialog").close();
  toneInit();
});

/* to get the backdrop working we need to trigger modal open with js */
document.getElementById("introDialog").showModal();

function toneInit() {
  mySynth.connect(myReverb);
  myReverb.toDestination();
}

let mySynth = new Tone.NoiseSynth();

let myReverb = new Tone.Reverb(10);

let synthButton = getElementById("synthTriggerBtn");
synthButton.addEventListener("click", () => {
  mySynth.triggerAttackRelease("C4", "8n");
});

/////////////// Representation of tone mental model ///////////////

/* 
Source          -------------->    Destination

Synthesizer     .toDesination()    Audio Driver ( => Audio Hardware )
Audio Player
*/

/* 
Trigger             ---------------------->   Source          

Pitch, Length       .triggerAttackRelease()   Synthesizer
Pitch, Start Time   .triggerAttack()      
End Time            .triggerRelease()

Start Playback      .start()                  Audio Player
Stop Playback       .stop()
*/

/* 
Source          --------->    Effect        -------------->    Destination

Synthesizer     .connect()    Reverb        .toDesination()    Audio Driver ( => Audio Hardware )
Audio Player                  Phaser        OR
                              Distortion    .connect()         Other Effect
                              etc
*/
