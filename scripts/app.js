
/**
 * 
 * farklı octave sayıları arasında geçiş yaparken, maxLine'dan az bir octave ile geçiş yapılabilir, - ile maxLine'a tamamla
 * 
 */
const app = Vue.createApp({
  data() {
    return {
      tab: {}, 
      tablature :  [],
      maxColCount : undefined,
      maxRowCount : undefined,
      lineCount : undefined,
      currentPage : 1,
      maxPage : undefined,
      orderedContainerTArray : [],
      tCount : undefined,
      dummyNoteArray : [], //silinecek
      dummyNoteArray2 : [], //silinecek
    };
  },
  beforeMount() {
    this.tab = tab;
    this.maxColCount = config.maxColCount;
    this.maxRowCount = config.maxRowCount;
    this.lineCount = config.lineCount;
    this.initNoteMap();
  },
  mounted() {        
    for(var i=0; i<this.maxColCount; i++) {
      this.dummyNoteArray.push(i % 8);
    }
    for(var i=0; i<this.maxColCount/2; i++) {
      this.dummyNoteArray2.push(i % 8);
    }
  },
  methods: {

    initNoteMap() {

      var noteMap = {};
      var orderedTArray = [];

      for(var i=0; i<this.tab.notes.length; i++) {      
        var t = this.tab.notes[i].t1;
        if(!noteMap[t]) {       
          noteMap[t] = [];
          orderedTArray.push(t);
        }
        noteMap[t].push(this.tab.notes[i].key);       
      }
      orderedTArray.sort((a, b) => a - b);

      var noteCount = 0;
      var containerIndex = 0;
      for(var i=0; i<orderedTArray.length; i++) {       
        
        var noteContainer = {};
        var noteList = [];
        var octaveList = this.getOctaveList(noteMap[orderedTArray[i]]);
        noteContainer.octaveList = Object.assign([], octaveList);
        for(var j=i; j<orderedTArray.length; j++) {          
          var currentOctaveList = this.getOctaveList(noteMap[orderedTArray[j]]);

         
          if(this.checkOctaveList(octaveList,currentOctaveList)) {
            for(var oi=0; oi<currentOctaveList.length; oi++) {
              if(!octaveList.includes(currentOctaveList[oi])) {
                octaveList.push(currentOctaveList[oi]);
                octaveList.sort((a, b) => a - b); 
                noteContainer.octaveList = Object.assign([], octaveList);
              }
            }
          } else {
            break;
          }

          var note = {};
       
          for(var ni=0; ni<noteMap[orderedTArray[j]].length; ni++) {
            note[this.getOctave(noteMap[orderedTArray[j]][ni])] = this.getKey(noteMap[orderedTArray[j]], this.getOctave(noteMap[orderedTArray[j]][ni]));
            noteCount = noteCount + 1;
          }   
          this.orderedContainerTArray.push({
            "containerIndex" : containerIndex,
            "noteIndex" : noteList.length
          });
          noteList.push(note);          
          i=j; //haydar
        }
        noteContainer.noteList = Object.assign([], noteList);
        this.tablature.push(Object.assign({}, noteContainer));
        containerIndex++;
      }   

      this.maxPage = Math.ceil(orderedTArray.length / (this.maxColCount * this.maxRowCount));
      this.tCount = this.orderedContainerTArray.length;


      var noteCount1=0;
      for(var i=0; i<orderedTArray.length; i++) {  
        noteCount1 = noteCount1 +   noteMap[orderedTArray[i]].length;   
      }     
      console.log("haydra:"+  this.tablature);
      console.log("noteCount :"+  noteCount);
      console.log("noteCount1 :"+  noteCount1);
      console.log("tcount :" + this.tCount);
      console.log("orderedTArray.length :"+  orderedTArray.length);


      
    },

    nextPage() {
      if(this.currentPage<this.maxPage) {
        this.currentPage ++;
      }
    },

    previousPage() {
      if(this.currentPage>1) {
        this.currentPage --;
      }
    },

    getOctave(key) {
      return Math.floor(key/12)-1
    },

    getOctaveList(keyList) {
      var octaves = [];
      for(var i=0; i<keyList.length; i++) {
        var octave = this.getOctave(keyList[i]);
        if(!octaves.includes(octave)) {
          octaves.push(octave);
        }
      }
      return octaves.sort((a, b) => a - b);      
    },

    checkOctaveList(mainOctaveList, currentOctaveList ) {
      var octaveList = Object.assign([], mainOctaveList);
      for(var oi=0; oi<currentOctaveList.length; oi++) {
        if(!octaveList.includes(currentOctaveList[oi])) {
          octaveList.push(currentOctaveList[oi]);
        }
      }
      return octaveList.length <= this.lineCount;
    },
    
    getKeySymbol(key) {
      var noteArray = ["1", "1'","2","2'","3","4","4'","5","5'","6","6'","7" ];
      return noteArray[key%12];
    },

    getKey(mainKeyList, octave) {
      var keyList = [];
      for(var i=0; i<mainKeyList.length; i++) {
        if(this.getOctave(mainKeyList[i]) == octave) {
          keyList.push(mainKeyList[i]);
        }
      }
      if(keyList.length > 1) {
        keyList.sort((a, b) => a - b);
        var key = "(";
        for(var i=0; i<keyList.length; i++) {         
            key = key + this.getKeySymbol(keyList[i]) + ' ';          
        }
        return key.trimEnd() + ')';
      } else {
        return this.getKeySymbol(keyList[0]);
      }
    },

    //var config = { "maxColCount": 30, "maxRowCount": 5, "lineCount": 4 }

    getRowCount(pageIndex) {
      var restOfNotesCount = this.tCount - (this.maxColCount * this.maxRowCount*(pageIndex-1));
      if(restOfNotesCount >= this.maxColCount*this.maxRowCount) {
        return this.maxRowCount;
      } else {
        return Math.ceil(restOfNotesCount/this.maxColCount);
      }    
    },

    getColumnCount(pageIndex, rowIndex) {
      var restOfNotesCount = this.tCount - ((this.maxColCount * this.maxRowCount*(pageIndex-1)) + (rowIndex*this.maxColCount));
      var containerIndexArray = [];
      var startIndex = this.tCount-restOfNotesCount;
      //for(var i=startIndex; i<(restOfNotesCount >= this.maxColCount?this.maxColCount:restOfNotesCount);  i++) {
      for(var i=startIndex; i<(startIndex + this.maxColCount <= this.tCount?startIndex + this.maxColCount:this.tCount);  i++) {
        if(!containerIndexArray.includes(this.orderedContainerTArray[i].containerIndex)) {
          containerIndexArray.push(this.orderedContainerTArray[i].containerIndex);
        }
      }
      return containerIndexArray.length;
    },

    getContainerList(pageIndex, rowIndex, columnIndex) {
      var restOfNotesCount = this.tCount - ((this.maxColCount * this.maxRowCount*(pageIndex-1)) + (rowIndex*this.maxColCount));    
      var containerList = [];
      var containerIndexArray = []
      var startIndex = this.tCount-restOfNotesCount;
      //for(var i=this.tCount-restOfNotesCount; i<(restOfNotesCount >= this.maxColCount?this.maxColCount:restOfNotesCount);  i++) {
        for(var i=startIndex; i<(startIndex + this.maxColCount <= this.tCount?startIndex + this.maxColCount:this.tCount);  i++) {
        if(!containerIndexArray.includes(this.orderedContainerTArray[i].containerIndex)) {
          containerIndexArray.push(this.orderedContainerTArray[i].containerIndex);
          if(containerIndexArray.length == columnIndex+1) {
            containerList.push(Object.assign({}, this.tablature[this.orderedContainerTArray[i].containerIndex]));
            containerList[containerList.length-1].t1=this.orderedContainerTArray[i].noteIndex;    
          }   
        }
        if(containerIndexArray.length == columnIndex + 1) {
          containerList[containerList.length-1].t2=this.orderedContainerTArray[i].noteIndex;
        }
      }
      return containerList;
    },
  },
});

app.mount("#app");
