angular.module('ngHumdrum', [])

  .constant('humConst', {

    E_unknown: 0x7fff,
    E_blank: 0x7fff - 1,
    E_base40_rest: -9999,

    ///////////////////////////////////////////////////////////////////////////////
    //
    // Chord Roots
    //

    E_root_rest: -9999,

    E_root_cff: 0,
    E_root_cf: 1,
    E_root_c: 2,
    E_root_cs: 3,
    E_root_css: 4,

    E_root_dff: 6,
    E_root_df: 7,
    E_root_d: 8,
    E_root_ds: 9,
    E_root_dss: 10,

    E_root_eff: 12,
    E_root_ef: 13,
    E_root_e: 14,
    E_root_es: 15,
    E_root_ess: 16,

    E_root_fff: 17,
    E_root_ff: 18,
    E_root_f: 19,
    E_root_fs: 20,
    E_root_fss: 21,

    E_root_gff: 23,
    E_root_gf: 24,
    E_root_g: 25,
    E_root_gs: 26,
    E_root_gss: 27,

    E_root_aff: 29,
    E_root_af: 30,
    E_root_a: 31,
    E_root_as: 32,
    E_root_ass: 33,

    E_root_bff: 35,
    E_root_bf: 36,
    E_root_b: 37,
    E_root_bs: 38,
    E_root_bss: 39,

    /////////////////////////////
    //
    // HumdrumRecord
    //

    E_humrec_none: 0x00000,
    E_humrec_empty: 0x00001,
    E_humrec_global_comment: 0x10000,
    E_humrec_bibliography: 0x10001,

    E_humrec_data: 0x20000,

    E_humrec_data_comment: 0x20001,
    E_humrec_local_comment: 0x20001,

    E_humrec_data_measure: 0x20002,
    E_humrec_data_kern_measure: 0x20002,

    E_humrec_data_interpretation: 0x20003,
    E_humrec_interpretation: 0x20003,
    E_humrec_interp: 0x20003

  })

  .factory('RationalNumber', function() {
    "use strict";

    var rational = function(anum, aden) {
      if (angular.isDefined(anum)) {
        this.set(anum, aden);
      } else {
        this.zero();
      }
    };

    rational.prototype.toString = function() {
      return (this.num === 0) ? "0" : this.num + "/" + this.den;
    };

    rational.prototype.gcd = function(x, y) {
      //Euclidean method
      //https://en.wikipedia.org/wiki/Greatest_common_divisor#Using_Euclid.27s_algorithm

      x = Math.round(Math.abs(x));
      y = Math.round(Math.abs(y));

      while (x > 0 && y > 0) {
        if (x > y) {
          x = x % y;
        } else {
          y = y % x;
        }
      }

      return Math.max(x, y);
    };

    rational.prototype.lcm = function(x, y) {
      var gcd = this.gcd(x, y),
        prod = Math.abs(Math.round(x) * Math.round(y));

      return prod / gcd;
    };

    rational.prototype.simplify = function() {
      var gcd = this.gcd(this.num, this.den);

      if (this.den < 0) {
        this.den = -this.den;
        this.num = -this.num;
      }

      this.num = this.num / gcd;
      this.den = this.den / gcd;
      return this;
    };

    rational.prototype.zero = function() {
      this.num = 0;
      this.den = 1;
      return this;
    };

    rational.prototype.set = function(anum, aden) {
      if (angular.isDefined(aden)) {
        this.num = Math.round(anum);
        this.den = Math.round(aden);
      } else if (angular.isDefined(anum)) {
        if (anum instanceof rational) {
          this.num = anum.num;
          this.den = anum.den;
        } else if (angular.isNumber(anum)) {
          this.num = Math.round(anum);
          this.den = 1;
        } else {
          throw "Invalid rational argument in set " + anum;
        }
      }
      return this;
    };

    rational.prototype.add = function(avalue) {
      if (avalue instanceof rational) {
        return (new rational(this.num * avalue.den + avalue.num * this.den, this.den * avalue.den)).simplify();
      } else if (angular.isNumber(avalue)) {
        return (new rational(this.num + Math.round(avalue) * this.den, this.den)).simplify();
      } else {
        throw "Invalid rational argument in add " + avalue;
      }
    };

    rational.prototype.sub = function(avalue) {
      if (avalue instanceof rational) {
        return (new rational(this.num * avalue.den - avalue.num * this.den, this.den * avalue.den)).simplify();
      } else if (angular.isNumber(avalue)) {
        return (new rational(this.num - Math.round(avalue) * this.den, this.den)).simplify();
      } else {
        throw "Invalid rational argument in sub " + avalue;
      }
    };

    rational.prototype.mul = function(avalue) {
      if (avalue instanceof rational) {
        return (new rational(this.num * avalue.num, this.den * avalue.den)).simplify();
      } else if (angular.isNumber(avalue)) {
        return (new rational(this.num * Math.round(avalue), this.den)).simplify();
      } else {
        throw "Invalid rational argument in mul " + avalue;
      }
    };

    rational.prototype.div = function(avalue) {
      if (avalue instanceof rational) {
        return (new rational(this.num * avalue.den, this.sub * avalue.num)).simplify();
      } else if (angular.isNumber(avalue)) {
        return (new rational(this.num, this.den * Math.round(avalue))).simplify();
      } else {
        throw "Invalid rational argument in div " + avalue;
      }
    };

    rational.prototype.toFloat = function() {
      return this.num / this.den;
    };

    rational.prototype.equals = function(avalue) {
      if (avalue instanceof rational) {
        return this.num * avalue.den === avalue.num * this.den;
      } else if (angular.isNumber(avalue)) {
        return this.toFloat() === avalue;
      } else {
        throw "Invalid rational argument in equals " + avalue;
      }
    };

    rational.prototype.lessThan = function(avalue) {
      if (avalue instanceof rational) {
        return this.toFloat() < avalue.toFloat();
      } else if (angular.isNumber(avalue)) {
        return this.toFloat() < avalue;
      } else {
        throw "Invalid rational argument in greaterThan " + avalue;
      }
    };

    rational.prototype.greaterThan = function(avalue) {
      return !this.lessThan(avalue);
    };

    return function(anum, aden) {
      return new rational(anum, aden);
    };
  })

  .factory('Enumeration', function(humConst) {
    "use strict";
    return function() {
      var associations = {},
        associations_rev = {};

      this.associate = function(aValue, aName) {
        associations[aValue] = aName;
        associations_rev[aName] = aValue;
      };

      this.getFreeValue = function() {
        var value = -1;
        angular.forEach(function(v, k) {
          if (k > value) {
            value = k;
          }
        });
        return value + 1;
      };

      this.getValue = function(aString) {
        return (associations_rev[aString] !== undefined) ? associations_rev[aString] : humConst.E_unknown;
      };

      this.getName = function(aValue) {
        return (associations[aValue] !== undefined) ? associations[aValue] : "";
      };
    };
  })

  .factory('humRecord', function(humConst, RationalNumber) {
    "use strict";

    var pathCountModifiers = ['*-', '*+', '*v', '*^', '*x'],
      humField = function(txt) {
        this.text = txt;
        this.exInterpNum = humConst.E_unknown;
      },
      humRec = function() {
        //type
        this.type = humConst.E_unknown;

        //fields
        this.fields = [];

        //line num
        this.lineNum = null;

        //rhythm fields
        this.DurationR = RationalNumber();
        this.AbsBeatR = RationalNumber();
        this.BeatR = RationalNumber();
      };

    //field methods
    humField.prototype.getExInterp = function() {
      return humConst.exint.getName(this.exInterpNum);
    };

    //record methods
    function determineRecType(aRecord) {
      var char0 = aRecord.charAt(0);
      if (char0 === '') {
        return humConst.E_humrec_empty;
      }
      // see if a data interpretation or tandem interpretation
      if (char0 === '*') {
        return humConst.E_humrec_data_interpretation;
      }
      // check if a kern measure
      if (char0 === '=') {
        return humConst.E_humrec_data_kern_measure;
      }
      // if first character is not a '!', then must be data
      if (char0 !== '!') {
        return humConst.E_humrec_data;
      }
      // if only one '!', then this is a local comment in the data
      if (aRecord.charAt(1) !== '!') {
        return humConst.E_humrec_data_comment;
      }
      // if two '!', then a global comment
      if (aRecord.charAt(2) !== '!') {
        return humConst.E_humrec_global_comment;
      }
      // if three or more '!', then is a bibliographic record
      return humConst.E_humrec_bibliography;
    };

    //public methods
    humRec.prototype.setLine = function(aLine) {
      var splitfields = [];

      //strip new line
      if ("\r\n".indexOf(aLine.slice(-1)) >= 0) {
        aLine = aLine.slice(0, -1);
      }

      this.type = determineRecType(aLine);

      if (
        aLine.length === 0 //empty
        ||
        (aLine.charAt(0) === '!' && aLine.charAt(1) === '!') //comment
      ) {
        splitfields.push(aLine);
      } else {
        splitfields = aLine.split("\t");
      }

      this.fields = splitfields.map(function(v) {
        return new humField(v);
      });
    };

    humRec.prototype.getSpineCount = function() { //return field count for data, 0 for others
      return ((this.type & humConst.E_humrec_data) === humConst.E_humrec_data) ? this.fields.length : 0;
    };

    humRec.prototype.toString = function() {
      return this.fields.map(function(f) {
        return f.text;
      }).join("\t");
    };

    humRec.prototype.hasExclusiveQ = function() {
      var i;
      if (this.type === humConst.E_humrec_data_interpretation) {
        i = 0;
        while (i < this.fields.length) {
          if (this.fields[i].text.slice(0, 2) === '**') {
            return true;
          }
          i = i + 1;
        }
      }
      return false;
    };

    humRec.prototype.hasPathQ = function() {
      var i;
      if (this.type === humConst.E_humrec_data_interpretation) {
        i = 0;
        while (i < this.fields.length) {
          if (pathCountModifiers.indexOf(this.fields[i].text) >= 0) {
            return true;
          }
          i = i + 1;
        }
      }
      return false;
    };

    humRec.prototype.splitPaths = function(maxTrackNum, newfields) {

      var i = 0,
        j,
        field,
        info = function(parents) {
          this.parents = parents;
        },
        ni;

      while (i < this.fields.length) {

        field = this.fields[i];

        switch (field.text) {
          case '*+':
            maxTrackNum = maxTrackNum + 1;
            ni = new info();
            ni.trackNum = maxTrackNum;
            newfields.push(ni);
            break;
          case '*-':
            break;
          case '*x':
            newfields.push(new info([this.fields[i + 1]]));
            newfields.push(new info([field]));
            i = i + 1;
            break;
          case '*^':
            ni = new info([field]);
            newfields.push(ni);
            newfields.push(ni);
            break;
          case '*v':
            j = i + 1;
            ni = new info([field]);
            while (j < this.fields.length && this.fields[j].text === field.text) {
              j = j + 1;
              ni.parents.push(this.fields[j]);
            };
            if (j - i === 1) {
              throw "Error: single *v pathindicator on line " + this.lineNum + ": " + this.toString();
            }
            newfields.push(ni);
            i = j - 1;
            break;
          default:
            newfields.push(new info([field]));
        }; //switch
        i = i + 1;
      }; //while

      return maxTrackNum;
    };

    return humRec;

  })

  .factory('humFile', function(humRecord, humConst, humConvert) {

    "use strict";

    var numRegExp = /\d/;

    return function(text) {

      var hf = this,
        records = [],
        trackExInterp = [],
        maxTrack = 0,
        segmentLevel = 0;


      this.read = function(text) {

        var currentExInterp = [],
          newpaths,
          field,
          init = false;

        function copyExInterp(rec) {
          var field;

          if (rec.fields.length !== currentExInterp.length) {
            throw "Error in spine allocation: " + rec.toString();
          }
          currentExInterp.reduce(function(p, old, i) {
            field = rec.fields[i];
            field.exInterpNum = old.exInterpNum;
            field.trackNum = old.trackNum;
            field.spineInfo = old.spineInfo;
          }, null);
        };

        function makeNewExInterp(rec, newpaths) {
          currentExInterp = newpaths.reduce(function(exint, ninfo, i) {
            if (ninfo.parents) {
              exint.push(ninfo.parents[0]);
            } else {
              var placeholder = new humField("");
              placeholder.trackNum = ninfo.trackNum;
              exint.push(placeholder);
            };
            return exint;
          }, []);
        };

        trackExInterp = [];
        records = [];
        maxTrack = 0;
        segmentLevel = 0;

        records = text.split("\n").map(function(line, n) {
          var r = new humRecord();
          //appendLine
          r.setLine(line);
          r.lineNum = n + 1;
          return r;
        });

        //Analyze spines
        records.reduce(function(p, r, n) {

          var value,
            i,
            w;

          //analyze
          if (r.type === humConst.E_humrec_data || r.type === humConst.E_humrec_data_measure || r.type === humConst.E_humrec_data_comment) {

            if (!init) {
              throw "Error on line " + (n + 1) + " of data: no starting interpretation";
            }
            copyExInterp(r);

          } else if (r.type === humConst.E_humrec_interpretation) {

            if (!init) {

              init = true;
              if (!r.hasExclusiveQ()) {
                throw "Error on line " + (n + 1) + " of file: No starting exclusive interpretation";
              }

              currentExInterp = [];
              trackExInterp = [];
              r.fields.reduce(function(p, field, i) {
                if (field.text.substr(0, 2) !== "**") {
                  throw "Error on line " + (n + 1) + ": nonexclusive";
                }
                field.exInterpNum = humConvert.exint.addIfNew(field.text);
                maxTrack = maxTrack + 1;
                field.trackNum = maxTrack;
                field.spineInfo = maxTrack.toString();
                currentExInterp.push(field);
                trackExInterp.push(field.exInterpNum);
              }, null);

            } else if (r.hasPathQ()) { //split

              newpaths = [];
              maxTrack = r.splitPaths(maxTrack, newpaths);
              w = n + 1;
              while (w < records.length && records[w].getSpineCount() === 0) {
                w = w + 1;
              }
              if ((w < records.length) && (newpaths.length !== records[w].fields.length)) {
                throw "Error on line " + (w + 1) + ": spine count does not match:  prediction = " + newpaths.length + " actual = " + records[w].fields.length;
              } else if ((w >= records.length) && (newpaths.length !== 0)) {
                throw "Error in termination of humdrum data";
              }
              copyExInterp(r);
              makeNewExInterp(r, newpaths);
            } else {
              // plain tandem interpretation
              if (!init) {
                throw "Error on first line of data: no starting interpretation";
              }
              copyExInterp(r);
            }
          } else {
            // do nothing: global comment, bibliography information, or null line
          }
        }, null);

      };

      this.getTracksByExInterp = function(tracks, exinterp) {
        exinterp = humConvert.exint.getValue(exinterp);
        //clear array
        tracks.splice(0, tracks.length);
        trackExInterp.reduce(function(p, v, i) {
          if (v === exinterp) {
            tracks.push(i);
          }
        }, null);
        return tracks.length;
      };
      this.getNumLines = function() {
        return records.length;
      };

      this.getLine = function(num) {
        return records[num];
      };

      this.getMaxTracks = function() {
        return trackExInterp.length;
      };

      this.read(text);
    };
  })

  .service('humExtras', function(humConst, humFile, humConvert, RationalNumber) {
    "use strict";
    var extras = this;

    this.extractVoiceName = function(text) {
      if (text.substr(0, 3) === '*I"') { //voice name
        return (text.charAt(3) === '[') ? text.substring(4, -1) : text.substr(3);
      } else {
        return undefined;
      }
    };

    this.searchMelody = function(hum, melody12) {

      var kernspines = [],
        results = [],
        voiceresult,
        rec, tokens, keynum,
        i, match_start, match_index, match_measure,
        name, measure;

      function isMatch(field, index) {
        tokens = field.text.split(' ');
        return tokens.reduce(function(result, v, t) {

          //if found do nothing
          if (result) return result;

          if (
            (v === ".") ||
            (v.indexOf("r") >= 0) ||
            (v.indexOf("_") >= 0) ||
            (v.indexOf("]") >= 0)
          ) {
            return result;
          }

          keynum = humConvert.kernToBase40(v);
          if (keynum >= 40 * 11) {
            throw "ERROR: Funny pitch: " + keynum + " = " + v;
          } else {
            return humConvert.base40ToBase12(keynum) % 12 === melody12[index];
          }

        }, false);
      };

      hum.getTracksByExInterp(kernspines, "**kern");

      kernspines.reduce(function(r, vindex) {
        measure = 0;
        voiceresult = {
          name: undefined,
          positions: []
        };
        i = 0;
        match_index = 0;
        while (i < hum.getNumLines()) {
          rec = hum.getLine(i);
          switch (rec.type) {
            case humConst.E_humrec_data:
              if (rec.fields[vindex].text === '.') {
                i = i + 1;
                break;
              };
              if (isMatch(rec.fields[vindex], match_index)) {
                if (match_index === 0) { //first match
                  match_start = i;
                  match_measure = measure;
                };
                match_index = match_index + 1;
                if (match_index >= melody12.length) { //found
                  voiceresult.positions.push({
                    start_measure: match_measure,
                    end_measure: measure
                  });
                  match_index = 0;
                };
              } else {
                if (match_index > 0) {
                  i = match_start + 1;
                  match_index = 0;
                  break;
                };
              };
              i = i + 1;
              break;
            case humConst.E_humrec_data_interpretation:
              voiceresult.name = voiceresult.name || extras.extractVoiceName(rec.fields[vindex].text);
              i = i + 1;
              break;
            case humConst.E_humrec_data_measure:
              measure = parseInt(rec.fields[vindex].text.substr(1)) || measure + 1;
            default:
              i = i + 1;
              break;
          }
        };
        if (voiceresult.positions.length > 0) results.push(voiceresult);
      }, undefined);

      return results;
    };

    this.prange = function(hum) {

      var i, rec, keynum,
        kernspines = [],
        bins = [],
        voicenames = {},
        emptybin = [],
        keys = {};

      function dataSpine(p, vindex, j) {
        var tokens,
          field = rec.fields[vindex];

        if (field.text === ".") { // ignore null tokens
          return;
        }

        tokens = field.text.split(' ');
        tokens.reduce(function(p, v, t) {
          if (
            (v === ".") ||
            (v.indexOf("r") >= 0) ||
            (v.indexOf("_") >= 0) ||
            (v.indexOf("]") >= 0)
          ) {
            return;
          }

          keynum = humConvert.kernToBase40(v);
          if (keynum >= 40 * 11) {
            throw "ERROR: Funny pitch: " + keynum + " = " + v + " krn: " + rec.toString();
          } else {
            bins[0][keynum] += 1.0;
            bins[j + 1][keynum] += 1.0;
          }
        }, null);
      }

      function interpSpine(p, vindex, i) {
        var f = rec.fields[vindex].text,
          name;
        if (name = extras.extractVoiceName(f)) { //voice name
          voicenames[i + 1] = name;
        } else if ((f.substr(0, 3) === '*k[') && !keys[i + 1]) { // first key
          keys[i + 1] = humConvert.keyToArray(f.substring(3, f.length - 1));
          keys[0] = keys[i + 1];
        }
      }

      hum.getTracksByExInterp(kernspines, "**kern");

      for (i = 0; i < 40 * 11; i = i + 1) {
        emptybin.push(0);
      }
      bins = kernspines.map(function(v) {
        return angular.copy(emptybin);
      });

      bins.push(emptybin);

      for (i = 0; i < hum.getNumLines(); i = i + 1) {

        rec = hum.getLine(i);

        switch (rec.type) {
          case humConst.E_humrec_data:
            kernspines.reduce(dataSpine, null);
            break;
          case humConst.E_humrec_data_interpretation:
            kernspines.reduce(interpSpine, null);
            break;
        }
      }

      return bins.map(function(v, i) {
        return {
          data: v,
          name: voicenames[i],
          key: keys[i]
        };
      });
    }; //prange

    this.proll = function(hum) {

      var i, rec, key40, keynum, duration,
        kernspines = [],
        voices = [],
        voicenames = {},
        positionR = RationalNumber(),
        lineDurationR = RationalNumber(),
        maxDuration = 10000,
        minKey = 10000,
        maxKey = -1;

      function dataSpine(p, vindex, j) {
        var tokens,
          field = rec.fields[vindex],
          keyvalid;

        if (field.text === ".") { // ignore null tokens
          return;
        }

        tokens = field.text.split(' ');
        tokens.reduce(function(p, v, t) {
          if (
            (v === ".") ||
            (v.indexOf("_") >= 0)
          ) {
            return;
          }

          key40 = humConvert.kernToBase40(v);
          duration = humConvert.kernToDurationR(v);

          keyvalid = (key40 != humConst.E_unknown && key40 != humConst.E_base40_rest);

          if (keyvalid) {
            keynum = humConvert.base40ToBase12(key40);
            minKey = Math.min(minKey, keynum);
            maxKey = Math.max(maxKey, keynum);
            if (!duration.equals(0)) {
              voices[j + 1].push({
                pitch: keynum,
                durationR: duration,
                positionR: positionR
              });
            }
          }
          if (duration.lessThan(lineDurationR)) {
            lineDurationR.set(duration);
          }
        }, null);
        return;
      }

      function interpSpine(p, vindex, i) {
        var f = rec.fields[vindex].text,
          name;
        if (f.substr(0, 3) === '*I"') { //voice name
          name = f.substr(3);
          voicenames[i + 1] = (name.charAt(0) === '[') ? name.substring(1, -1) : name;
        }
      }

      hum.getTracksByExInterp(kernspines, "**kern");

      voices = kernspines.map(function(v) {
        return [];
      });

      voices.push([]);

      for (i = 0; i < hum.getNumLines(); i = i + 1) {

        rec = hum.getLine(i);

        rec.AbsBeatR.set(positionR);

        switch (rec.type) {
          case humConst.E_humrec_data:
            lineDurationR.set(maxDuration);
            kernspines.reduce(dataSpine, null);
            if (lineDurationR.lessThan(maxDuration)) {
              rec.DurationR.set(lineDurationR);
              positionR = positionR.add(lineDurationR);
            };
            break;
          case humConst.E_humrec_data_interpretation:
            kernspines.reduce(interpSpine, null);
            break;
        }
      }

      return {
        voices: voices.map(function(v, i) {
          return {
            notes: v,
            name: voicenames[i],
          };
        }),
        minKey: minKey,
        maxKey: maxKey,
        totalDuration: positionR
      };
    }; //proll
  })

  .service('humConvert', function(humConst, RationalNumber, Enumeration) {
    "use strict";
    var hc = this,
      letterToRoot = {
        a: humConst.E_root_a,
        b: humConst.E_root_b,
        c: humConst.E_root_c,
        d: humConst.E_root_d,
        e: humConst.E_root_e,
        f: humConst.E_root_f,
        g: humConst.E_root_g,
        A: humConst.E_root_a,
        B: humConst.E_root_b,
        C: humConst.E_root_c,
        D: humConst.E_root_d,
        E: humConst.E_root_e,
        F: humConst.E_root_f,
        G: humConst.E_root_g,
        R: humConst.E_root_rest
      },
      chroma12ToKern = [
        "c",
        "c#",
        "d",
        "e-",
        "e",
        "f",
        "f#",
        "g",
        "g#",
        "a",
        "h-",
        "h"
      ],
      chroma40ToKern = [
        "C--", //0
        "C-",
        "C",
        "C#",
        "C##",
        undefined, //5
        "D--",
        "D-",
        "D",
        "D#",
        "D##",
        undefined, //11
        "E--",
        "E-",
        "E",
        "E#",
        "E##",
        "F--",
        "F-",
        "F",
        "F#",
        "F##",
        undefined, //22
        "G--",
        "G-",
        "G",
        "G#",
        "G##",
        undefined, //28
        "A--",
        "A-",
        "A",
        "A#",
        "A##",
        undefined, //34
        "H--",
        "H-",
        "H",
        "H#",
        "H##"
      ],
      chroma12ToBase40 = [
        humConst.E_root_c, // 0  = C
        humConst.E_root_cs, // 1  = C#
        humConst.E_root_d, // 2  = D
        humConst.E_root_ef, // 3  = E-
        humConst.E_root_e, // 4  = E
        humConst.E_root_f, // 5  = F
        humConst.E_root_fs, // 6  = F#
        humConst.E_root_g, // 7  = G
        humConst.E_root_af, // 8  = A-
        humConst.E_root_a, // 9  = A
        humConst.E_root_bf, // 10 = B-
        humConst.E_root_b // 11 = B
      ],
      kernRegExp = /([abcdefgr]+[#-]?)/i,
      kernSpecialRhythm = /(\d+)[\D](\d+)/g,
      kernRhythm = /[\D]*(\d+)/;

    function repeatKern(octave, kern) {

      var repeat = 0,
        output = "";

      if (octave >= 4) {
        kern = kern.toLowerCase();
      } else {
        kern = kern.toUpperCase();
      }

      switch (octave) {
        case 4:
          repeat = 0;
          break;
        case 5:
          repeat = 1;
          break;
        case 6:
          repeat = 2;
          break;
        case 7:
          repeat = 3;
          break;
        case 8:
          repeat = 4;
          break;
        case 9:
          repeat = 5;
          break;
        case 3:
          repeat = 0;
          break;
        case 2:
          repeat = 1;
          break;
        case 1:
          repeat = 2;
          break;
        case 0:
          repeat = 3;
          break;
        case -1:
          repeat = 4;
          break;
        default:
          throw "Error: unknown octave value: " + octave;
      }

      while (repeat > 0) {
        output += kern.charAt(0);
        repeat = repeat - 1;
      }

      return output + kern;
    }

    this.kernToBase40 = function(kernfield) {

      if (kernfield.charAt(0) === '.') {
        return -1;
      }

      var note = kernRegExp.exec(kernfield);

      if (note === null) { //note character not found
        return humConst.E_unknown;
      } else if (note[1].charAt(0).toUpperCase() === 'R') { //rest
        return humConst.E_base40_rest;
      } else {
        return this.kernNoteToBase40(note[1]);
      }
    };

    this.voiceToColor = function(i, count, op) {
      op = op || 0.5;
      return 'hsla(' + (180 * i / (count - 1)) + ',100%,40%,' + op + ')';
    };

    this.kernToDurationR = function(kernfield) {
      var dotcount = 0,
        index = 0,
        matches,
        rtop,
        rbot,
        output = RationalNumber(),
        dotdiv,
        temp;

      // check for grace notes
      if (kernfield.indexOf('q') >= 0 || kernfield.indexOf('Q') >= 0) {
        return output;
      }

      // check for dots to modify rhythm
      // also add an exit if a space is found, so that dots
      // from multiple notes in chord notes do not get accidentally
      // get counted together (input to this function should be a
      // single note, but chords may accidentally be sent to this
      // function instead).
      while (index < kernfield.length && kernfield.charAt(index) !== ' ') {
        if (kernfield.charAt(index) === '.') {
          dotcount = dotcount + 1;
        }
        index = index + 1;
      }

      // parse special rhythms which can't be represented in
      // classical **kern definition.  A non-standard rhythm
      // consists of two numbers separated by any character.
      matches = kernSpecialRhythm.exec(kernfield);
      if (matches) {
        rtop = parseInt(matches[1]);
        rbot = parseInt(matches[2]);
        temp = RationalNumber(rbot, rtop);
        output.set(rbot, rtop);

      } else {
        // parse regular rhythm by looking for a number
        matches = kernRhythm.exec(kernfield);
        if (matches) {
          temp = parseInt(matches[1]);
          if (matches[1].charAt(0) === '0' && temp === 0) { // only zeros
            output.set(matches[1].length + 1, 1);
          } else {
            output.set(1, temp);
          }
        }
      }

      //add dots
      temp = RationalNumber(output);
      while (dotcount > 0) {
        temp = temp.div(2);
        output = output.add(temp);
        dotcount = dotcount - 1;
      }
      //may be zero
      return output;
    };

    this.keyToArray = function(key) {
      var output = [],
        start = 0,
        i = 0;
      while (i < key.length) {
        if ('-#'.indexOf(key.charAt(i)) >= 0) {
          output.push(key.substring(start, i + 1));
          start = i + 1;
        }
        i = i + 1;
      }
      return output;
    };

    this.kernNoteToBase40 = function(name) {

      function addAccidental(acc) {
        if (acc === '-') {
          return -1;
        }
        if (acc === '#') {
          return 1;
        }
        return 0;
      }

      //use hash map for root
      var char0 = name.charAt(0),
        output = letterToRoot[char0],
        octave = 0;

      //any not valid letter (including .)
      if (output === undefined) {
        return -1;
      }

      //find octave
      while (name.charAt(octave) === char0) {
        octave = octave + 1;
      };

      if (char0.toLowerCase() === char0) { //is lowercase
        output += (3 + octave) * 40;
      } else {
        output += (4 - octave) * 40;
      }

      // check for first accidental sign
      output += addAccidental(name.charAt(octave));

      // check for second accidental sign
      output += addAccidental(name.charAt(octave + 1));

      //validate output
      if (output < 0) {
        throw 'Error: pitch "' + name + '" is too low.';
      }

      return output;
    };

    //////////////////////////////
    //
    // base40ToDiatonic -- find the diatonic pitch of the
    //   given base 40 note.  0 = C, 1 = D, 2 = E, 3 = F.
    //   To get the diatonic pitch class, mod by 7: (% 7).
    //
    this.base40ToDiatonic = function(pitch) {
      var chroma = pitch % 40,
        octaveoffset = Math.floor(pitch / 40) * 7;

      if (pitch < 0) {
        return -1; // rest;
      }

      if (
        (chroma >= 0) &&
        (chroma !== 5) &&
        (chroma !== 11) &&
        (chroma !== 22) &&
        (chroma !== 28) &&
        (chroma !== 34)
      ) {
        if (chroma <= 4) {
          return octaveoffset;
        } else if (chroma <= 10) {
          return 1 + octaveoffset;
        } else if (chroma <= 16) {
          return 2 + octaveoffset;
        } else if (chroma <= 21) {
          return 3 + octaveoffset;
        } else if (chroma <= 27) {
          return 4 + octaveoffset;
        } else if (chroma <= 33) {
          return 5 + octaveoffset;
        } else if (chroma <= 39) {
          return 6 + octaveoffset;
        }
      }
      return -1;
    };

    this.base12ToBase40 = function(aPitch) {
      var octave = Math.floor(aPitch / 12) - 1,
        chroma = aPitch % 12,
        output = chroma12ToBase40[chroma];

      if (output === undefined) {
        throw "Undefined base40 " + aPitch;
      }
      return output + 40 * octave;
    };

    //////////////////////////////
    //
    // Convert::base40ToScoreVPos -- get the position of a note on a staff
    //     according to the given clef.  The input clef is the SCORE
    //     clef number:
    //
    //     0 = treble
    //     1 = bass
    //     2 = alto
    //
    //     for other clefs, add/subtract according to the give default
    //     position for G, F, or C clefs.
    //
    //     The zero position is the space below the first ledger line
    //     on the staff.
    //

    this.base40ToScoreVPos = function(pitch, clef) {
      var octave = Math.floor(pitch / 40),
        diatonic = hc.base40ToDiatonic(pitch);
      // make sure diatonic is diatonic pitch class
      diatonic = diatonic % 7;
      switch (clef) {
        case 1: // bass clef
          return (octave - 2) * 7 + diatonic - 1;
        case 2: // alto clef
          return (octave - 3) * 7 + diatonic;
        //case 0:                              // treble clef
        default:
          return (octave - 4) * 7 + diatonic + 1;
      }
    };

    this.base40ToBase12 = function(base40) {
      var octave,
        pitch;

      if ((base40 < 0) || (base40 === humConst.E_unknown)) {
        return -1;
      }

      octave = Math.floor(base40 / 40);
      pitch = 0;

      switch (base40 % 40) {
        case 0:
          pitch = -2;
          break; // C--
        case 1:
          pitch = -1;
          break; // C-
        case 2:
          pitch = 0;
          break; // C
        case 3:
          pitch = 1;
          break; // C#
        case 4:
          pitch = 2;
          break; // C##

        case 6:
          pitch = 0;
          break; // D--
        case 7:
          pitch = 1;
          break; // D-
        case 8:
          pitch = 2;
          break; // D
        case 9:
          pitch = 3;
          break; // D#
        case 10:
          pitch = 4;
          break; // D##

        case 12:
          pitch = 2;
          break; // E--
        case 13:
          pitch = 3;
          break; // E-
        case 14:
          pitch = 4;
          break; // E
        case 15:
          pitch = 5;
          break; // E#
        case 16:
          pitch = 6;
          break; // E##

        case 17:
          pitch = 3;
          break; // F--
        case 18:
          pitch = 4;
          break; // F-
        case 19:
          pitch = 5;
          break; // F
        case 20:
          pitch = 6;
          break; // F#
        case 21:
          pitch = 7;
          break; // F##

        case 23:
          pitch = 5;
          break; // G--
        case 24:
          pitch = 6;
          break; // G-
        case 25:
          pitch = 7;
          break; // G
        case 26:
          pitch = 8;
          break; // G#
        case 27:
          pitch = 9;
          break; // G##

        case 29:
          pitch = 7;
          break; // A--
        case 30:
          pitch = 8;
          break; // A-
        case 31:
          pitch = 9;
          break; // A
        case 32:
          pitch = 10;
          break; // A#
        case 33:
          pitch = 11;
          break; // A##

        case 35:
          pitch = 9;
          break; // B--
        case 36:
          pitch = 10;
          break; // B-
        case 37:
          pitch = 11;
          break; // B
        case 38:
          pitch = 12;
          break; // B#
        case 39:
          pitch = 13;
          break; // B##

        default:
          console.log("Pitch Unknown: " + (base40 % 40));
          pitch = -1000;
      };

      return octave * 12 + pitch + 12;
    } //base40Tobase12

    this.base12ToKern = function(aPitch) {
      var octave = Math.floor(aPitch / 12) - 1, // possible bug fix or bug creation
        chroma = aPitch % 12,
        kern;

      if ((octave > 12) || (octave < -1)) {
        throw "Error: unreasonable octave value: " + octave;
      }

      kern = chroma12ToKern[chroma];
      return repeatKern(octave, kern);
    };

    this.base40ToNote = function (pitch) {
        var k = this.base40ToKern(pitch % 40 + 160);
        switch (k.substr(-1)) {
            case '-':
                k = k.substr(0,k.length-1) + '♭­';
                break;
            case '#':
                k = k.substr(0,k.length-1) + '♯';
                break;
        }
        return k.substr(0,1).toUpperCase() + Math.floor(pitch / 40) + k.substr(1);
    };

    //////////////////////////////
    //
    // Convert::base40ToKern --
    //

    this.base40ToKern = function(aPitch) {
      var octave = Math.floor(aPitch / 40),
        chroma = aPitch % 40,
        kern;

      if (octave > 12 || octave < -1) {
        throw "Error: unreasonable octave value: " + octave;
      }

      kern = chroma40ToKern[chroma];
      return repeatKern(octave, kern);
    }


    //Extended Int enumeration
    this.exint = new Enumeration();
    this.exint.nextenumeration = 1000;
    this.exint.add = function(aString) {
      this.associate(this.nextenumeration, aString);
      this.nextenumeration = this.nextenumeration + 1;
      return this.nextenumeration - 1;
    };
    this.exint.addIfNew = function(aString) {
      var v = this.getValue(aString);
      return (v !== humConst.E_unknown) ? v : this.add(aString);
    };
  })

  .directive('prange', function(humFile, humExtras, humConvert) {
    return {
      restrict: 'E',
      scope: {
        krnFile: '=',
        voiceNames: '='
      },
      link: function($scope, $element) {

        $scope.params = {
          lineH: 100,
          strokeWidth: 4,
          clefStart: 180,
          barStart: 100,
          barEnd: 7000,
          barMargin: 150,
          keyStart: 600,
          barGap: 2,
          topMargin: 150,
          fontSize: 150,
          minTop: 0,
          maxBottom: 1000
        };

        function base40ToY(pitch) {
          var clef = (pitch < 162) ? 1 : 0, //c
            vpos = humConvert.base40ToScoreVPos(pitch, clef);
          return (((clef) ? $scope.params.barGap * 2 + 10 * 2 - 1 : 5 * 2 + 1) - vpos) * 50;
        };

        $scope.$watch('krnFile', function(nv) {
          if (!nv) return;
          var hum = nv,
            bins = humExtras.prange(hum),
            middleC = humConvert.kernToBase40('c'),
            sharpBase = humConvert.kernToBase40('g#'),
            flatBase = humConvert.kernToBase40('e-');

          $scope.maxn = 0;
          $scope.voices = [];

          bins.reduce(function(p, bin, i) {
            var bars = [],
              lastbar = undefined,
              sum = 0,
              cumsum = 0,
              median, j, ypos, voice;

            bin.data.reduce(function(p, n, pitch) {
              if (n > 0) {
                ypos = base40ToY(pitch);
                if (lastbar && (lastbar.ypos === ypos)) {
                  lastbar.n += n;
                  lastbar.note += ' + ' + n + ' ' + humConvert.base40ToNote(pitch);
                } else {
                  lastbar = {
                    pitch: pitch,
                    n: n,
                    ypos: ypos,
                    note: n + ' ' + humConvert.base40ToNote(pitch)
                  };
                  bars.push(lastbar);
                };
                if (lastbar.n > $scope.maxn) $scope.maxn = lastbar.n;
                sum += n;
              }
            }, null);

            //calculate median
            for (j = 0; j < bars.length; j = j + 1) {
              cumsum += bars[j].n / sum;
              if (cumsum >= 0.5) {
                median = bars[j];
                break;
              }
            }

            if (bars.length > 0) {
              voice = {
                bars: bars,
                name: (($scope.voiceNames || {})[i]) || bin.name ||  ((i == 0) ? 'Ambitus' : 'Głos ' + i),
                color: (i == 0) ? 'black' : humConvert.voiceToColor(i - 1, bins.length - 1, 0.8),
                minpitch: bars[0],
                maxpitch: bars[bars.length - 1],
                median: median
              };
              $scope.params.maxBottom = Math.max($scope.params.maxBottom, voice.minpitch.ypos);
              $scope.params.minTop = Math.min($scope.params.minTop, voice.maxpitch.ypos);
              $scope.voices.push(voice);
              voice.lineMiddleC = [voice.minpitch.pitch, voice.maxpitch.pitch, median.pitch].indexOf(middleC) >= 0;
              voice.linesTop = []; for(var t = -100; t >= voice.maxpitch.ypos; t -= 100) voice.linesTop.push(t);
              voice.linesBottom = []; for(var t = 1000 + ($scope.params.barGap - 2) * 100 + 100; t <= voice.minpitch.ypos; t += 100) voice.linesBottom.push(t);
            };
          }, null);

          $scope.voices.reverse();
          $scope.key = {
            flats: [],
            sharps: []
          };

          bins[0].key.reduce(function (pr, k, i) {
            var p = humConvert.kernToBase40(k),
              flat = k.indexOf('-') >= 0,
              key;

            if (flat) {
              key = (p <= flatBase) ? p + 40 : p;
              $scope.key.flats.push({ y1: base40ToY(key), y2: base40ToY(key - 80)});
            } else {
              key = (p <= sharpBase) ? p + 40 : p;
              $scope.key.sharps.push({ y1: base40ToY(key), y2: base40ToY(key - 80)});
            };
            console.log(k, p, key, flat, flatBase, sharpBase);
          }, null);

          let accidentals = $scope.key.flats.length + $scope.key.sharps.length;
          $scope.params.voiceStart =  $scope.params.keyStart;
          if (accidentals) $scope.params.voiceStart += accidentals * 100 + 200;
          $scope.params.scale = $scope.params.lineH / 100;
          $scope.params.voiceWidth = ($scope.params.barEnd - $scope.params.voiceStart) / $scope.voices.length;
          $scope.params.barScale = ($scope.params.voiceWidth - $scope.params.barMargin * 2) / $scope.maxn;
          $scope.params.topMargin = Math.max($scope.params.topMargin, -$scope.params.minTop + 100);
          $scope.params.voiceNameY = $scope.params.maxBottom + 150 + $scope.params.fontSize;
          $scope.params.maxBottom = $scope.params.voiceNameY +  $scope.params.fontSize;
          //svg viewBox workaround
          $element.children()[0].setAttribute("viewBox", "0 0 " + ($scope.params.barEnd*$scope.params.scale) + " " + (($scope.params.topMargin+$scope.params.maxBottom)*$scope.params.scale));
        });
      },
      template: "<svg version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" viewBox=\"0 0 0 0\" width=\"100%\">\
<g ng-attr-style=\"stroke:black;stroke-width:{{params.strokeWidth}}\" ng-attr-transform=\"translate(0, {{params.topMargin*params.scale}}) scale({{params.scale}})\">\
<!-- klamra -->\
<path\
   d=\"M 63.143,0 42.57153,23.428624 36.2858,31.714357 25.142914,48.285824 15.714322,67.428724 9.428592,84.00019 4.571439,103.14309 1.428574,122.28599 0,147.14319 v 13.71431 l 3.142864,27.42864 4.571439,24.8572 23.714337,97.42879 6.28573,34.28579 4.85715,35.71437 v 18.00004 l -3.14286,30.00007 -4.85715,19.42861 -3.14287,8.28573 -8.000016,13.71432 L 0,500.00113 l 23.428624,30.28578 8.000016,13.71432 3.14287,8.28573 4.85715,19.1429 3.14286,30.28579 v 18.00004 l -4.85715,35.71436 -6.28573,34.2858 L 7.714303,787.14464 3.142864,812.00184 0,839.43047 v 13.71432 l 1.428574,24.8572 3.142865,19.1429 4.857153,19.1429 6.28573,16.57146 9.428592,19.14291 11.142886,16.57146 6.28573,8.28573 L 63.143,1000.0023 44.0001,970.0022 33.14293,949.43072 25.142914,928.57353 18.857186,901.1449 17.142896,878.00199 v -9.71431 l 3.142864,-24.8572 6.571444,-28.85721 7.714306,-26.00005 8.00001,-27.42864 12.57146,-49.42868 3.14287,-19.1429 3.14286,-27.71435 1.71429,-19.1429 V 623.7157 l -4.85715,-37.14294 -6.28573,-17.71433 -9.4286,-19.1429 -11.14288,-15.14289 -30.000066,-34.57151 30.000066,-34.28579 11.14288,-15.14289 9.4286,-19.1429 6.28573,-17.71432 4.85715,-37.14295 V 354.57223 L 61.42871,335.42933 58.28585,307.71499 55.14298,288.57208 42.57152,239.1434 34.57151,211.71477 26.857204,185.71471 20.28576,156.8575 17.142896,132.0003 v -9.71431 L 18.857186,99.143082 25.142914,71.428733 33.14293,50.857258 44.0001,30.285783 Z\"\
ng-attr-transform=\"scale(1,{{(params.barGap+8)/10}})\"\
/>\
<!-- wiolinowy -->\
<path\
   d=\"m 176.74914,97.92618 c -9.19736,1.59954 -19.19448,2.39931 -30.39126,2.39931 -23.59321,0 -40.78826,-2.79919 -51.985038,-7.9977 C 59.182969,75.53262 34.390104,55.13849 19.594361,30.74551 9.1973533,13.15058 2.3993096,-10.44263 0.39988493,-39.63423 0.39988493,-42.03354 0,-44.83274 0,-47.23205 c 0,-21.59378 5.9982739,-44.38722 17.994822,-67.98043 11.596662,-22.79345 25.99252,-42.38781 43.987341,-59.18297 17.994822,-16.79517 38.388957,-33.99022 61.182397,-50.78539 -1.19966,-6.39816 -3.19908,-18.39471 -5.19851,-36.78941 -1.59954,-17.19505 -1.99942,-29.1916 -1.99942,-35.58976 0,-46.78654 6.39816,-68.78021 27.59206,-102.77043 13.59609,-21.59378 25.59263,-32.79056 35.58976,-32.79056 8.39758,0 17.19505,11.99655 27.59206,36.78941 10.397,24.79287 15.59551,45.98677 16.39528,63.58171 v 5.99827 c 0,43.58746 -8.39759,64.78136 -26.79229,96.37227 -5.19851,7.9977 -25.19275,35.98964 -39.18872,47.18642 -5.19851,3.59896 -9.99713,7.59781 -14.79575,11.59666 l 12.39644,72.37917 c 3.19908,-0.39988 7.19792,-0.79977 11.19677,-0.79977 23.19333,0 40.78827,4.79862 53.1847,13.99598 23.59321,17.19505 36.78941,41.58803 39.18872,73.57882 0.39989,2.7992 0.39989,5.99828 0.39989,8.79747 0,49.18585 -34.78999,83.57595 -72.37917,99.17146 3.19907,22.79344 6.79804,43.98734 9.99712,64.78136 1.99942,12.39643 2.39931,23.19332 2.39931,31.99079 0,11.99655 -1.99943,21.1939 -5.59839,27.99195 -13.99597,25.59263 -35.18987,39.58861 -63.18182,41.18815 -1.99942,0 -4.39873,0.39988 -6.39816,0.39988 -14.79574,0 -28.791713,-3.99885 -43.18757,-10.79689 C 60.382624,241.48487 49.585731,227.4889 48.386076,209.09419 v -4.39873 c 0,-11.59667 2.799194,-21.99368 7.997698,-30.39126 7.197929,-11.19678 17.994822,-16.79517 31.59091,-17.59494 h 2.399309 c 19.594357,0 37.189297,16.79517 38.788837,34.78999 v 3.59897 c 0,20.39413 -13.59609,34.3901 -41.987916,42.3878 6.798043,9.59724 20.394126,14.39586 40.788266,14.39586 24.79286,0 46.38665,-17.19505 55.98389,-33.99022 3.59896,-6.39816 5.1985,-16.39528 5.1985,-29.59149 0,-7.99769 -0.39989,-16.79516 -1.99943,-26.79229 -3.19907,-21.1939 -7.19792,-42.3878 -10.397,-63.5817 z m 7.9977,-473.46375 c -37.98907,0 -53.98447,69.97986 -53.98447,114.36709 0,9.59724 0.79977,19.19447 1.99943,28.39183 19.99424,-15.59551 36.78941,-32.79057 50.78538,-51.18527 15.9954,-21.1939 23.9931,-39.9885 23.9931,-55.98389 v -3.19908 c -1.59954,-21.1939 -8.79747,-32.39068 -21.99367,-32.39068 z m -21.99368,327.90564 21.59379,130.36248 c 29.1916,-9.99712 43.98734,-31.19102 43.98734,-64.38147 0,-2.79919 0,-5.99827 -0.39988,-9.19735 -2.7992,-37.98907 -22.79344,-56.78366 -60.38263,-56.78366 z m -9.59723,0.79977 c -28.79172,0.79977 -51.18527,18.79459 -51.18527,47.98619 v 2.79919 c 0.79977,18.39471 17.19505,39.58861 29.99137,45.98677 -1.19966,0.79977 -2.7992,1.99942 -3.99885,3.99885 C 99.971231,40.74264 81.576525,18.74897 78.77733,-14.84137 v -4.39873 c 0,-27.19218 17.594937,-50.3855 35.18987,-63.58171 9.19736,-6.79804 19.59437,-11.59666 31.19103,-14.39585 l -11.59666,-67.98044 c -8.39759,5.1985 -20.79402,14.79574 -36.789418,29.1916 -19.994246,17.59494 -34.390104,33.59033 -43.587457,47.58631 -17.994822,27.59206 -26.79229,51.98504 -26.79229,72.77905 v 5.19851 c 1.999425,27.19217 13.995972,50.78538 37.189298,70.37974 23.193326,19.59436 49.985617,29.1916 81.176637,29.1916 9.99713,0 19.99425,-1.19965 29.99137,-3.59896 C 167.1519,41.14252 160.35386,-2.84482 153.15593,-46.83216 Z\"\
   stroke=\"none\"\
ng-attr-transform=\"translate({{params.clefStart}},300)\" />\
<!-- basowy -->\
<path\
     d=\"m 61.00864,-38.5952 c 20.20416,0 28.91968,5.54624 34.86208,19.41184 l 6.33856,15.45024 c 0,6.73472 -0.79232,11.8848 -2.77312,15.8464 -1.18848,4.35776 -3.9616,8.31936 -7.52704,12.28096 -6.73472,7.13088 -19.41184,17.03488 -33.27744,17.03488 -21.7888,0 -30.50432,-5.15008 -44.36992,-17.43104 -9.50784,-8.31936 -13.8656,-21.7888 -13.8656,-39.616 0,-18.22336 5.54624,-32.08896 12.67712,-44.36992 11.8848,-20.60032 28.12736,-31.29664 54.27392,-36.84288 L 81.60896,-99.20768 91.90912,-100 c 61.00864,0 93.0976,26.93888 108.54784,72.10112 4.35776,12.67712 7.13088,26.93888 7.13088,42.38912 0,40.80448 -10.30016,72.10112 -26.93888,99.04 -35.25824,57.4432 -92.70144,91.1168 -163.21792,114.09408 l -11.8848,1.9808 C 1.9808,229.60512 0,228.41664 0,226.43584 c 1.18848,-3.9616 1.9808,-4.35776 3.9616,-6.33856 13.8656,-5.9424 27.7312,-11.8848 38.03136,-17.43104 l 30.90048,-17.03488 c 38.03136,-22.58112 64.17792,-53.87776 78.04352,-102.20928 3.56544,-13.07328 6.73472,-23.7696 8.71552,-39.616 1.18848,-8.71552 1.9808,-13.8656 2.37696,-15.45024 -2.77312,-27.33504 -6.33856,-45.5584 -9.11168,-55.4624 -2.77312,-9.904 -1.58464,-8.71552 -6.33856,-15.8464 -3.16928,-4.75392 -7.52704,-9.11168 -12.28096,-13.46944 -9.50784,-8.31936 -24.56192,-17.43104 -46.74688,-17.43104 -19.01568,0 -33.27744,3.16928 -44.76608,11.09248 -11.09248,7.52704 -16.63872,17.43104 -16.63872,28.91968 v 6.33856 c 0.79232,1.9808 1.18848,3.56544 1.58464,4.35776 9.50784,-8.71552 20.60032,-15.45024 33.27744,-15.45024 z m 169.16032,84.77824 c 0,-12.67712 9.11168,-22.97728 22.58112,-22.97728 7.13088,0 13.07328,2.37696 15.8464,7.13088 3.56544,5.9424 6.33856,7.13088 6.33856,15.8464 0,3.56544 -0.79232,6.33856 -1.9808,8.31936 -2.37696,7.52704 -10.69632,14.65792 -20.20416,14.65792 -13.46944,0 -22.58112,-10.30016 -22.58112,-22.97728 z m 22.58112,-116.8672 c 12.28096,0 22.18496,10.69632 22.18496,22.97728 0,11.8848 -9.904,22.97728 -22.18496,22.97728 l -9.11168,-1.18848 c -7.52704,-2.77312 -13.46944,-12.67712 -13.46944,-21.7888 l 1.18848,-9.11168 c 3.56544,-7.9232 11.09248,-13.8656 21.39264,-13.8656 z\"\
     stroke=\"none\"\
ng-attr-transform=\"translate({{params.clefStart}},{{(params.barGap+5)*100}})\" />\
/>\
<!-- pięciolinie -->\
<line ng-repeat=\"i in [0,1,2,3,4]\" ng-attr-x1=\"{{params.barStart}}\" ng-attr-y1=\"{{100*i}}\" ng-attr-x2=\"{{params.barEnd}}\" ng-attr-y2=\"{{100*i}}\" />\
<line ng-repeat=\"i in [0,1,2,3,4]\" ng-attr-x1=\"{{params.barStart}}\" ng-attr-y1=\"{{100*(i+4+params.barGap)}}\" ng-attr-x2=\"{{params.barEnd}}\" ng-attr-y2=\"{{100*(i+4+params.barGap)}}\" />\
<line ng-attr-x1=\"{{params.barStart}}\" y1=\"0\" ng-attr-x2=\"{{params.barStart}}\" ng-attr-y2=\"{{(8+params.barGap)*100}}\" />\
<line ng-attr-x1=\"{{params.barEnd}}\" y1=\"0\" ng-attr-x2=\"{{params.barEnd}}\" ng-attr-y2=\"{{(8+params.barGap)*100}}\" />\
<!-- tonacja -->\
<path ng-repeat=\"f in key.sharps\" ng-attr-transform=\"translate({{params.keyStart+$index*100}},{{f.y1}})\" \
       d=\"M 15.22843,-72.32853 V -141 h 6.90355 v 66.63976 L 40,-80.04899 v 36.97694 l -17.86802,5.68877 V 29.66283 L 40,24.78675 v 36.97694 l -17.86802,5.28242 v 62.98271 H 15.22843 V 69.07781 l -30.862948,8.93948 V 141 h -6.903553 V 80.45534 L -40,85.73775 v -36.5706 l 17.461929,-5.68877 V -24.38041 L -40,-18.69164 v -37.38328 l 17.461929,-5.28243 v -68.67147 h 6.903553 v 66.23343 z M -15.634518,-26.4121 V 41.44669 L 15.22843,32.50721 v -68.26514 z\"\
       stroke=\"none\"\
/>\
<path ng-repeat=\"f in key.sharps\" ng-attr-transform=\"translate({{params.keyStart+$index*100}},{{f.y2}})\" \
       d=\"M 15.22843,-72.32853 V -141 h 6.90355 v 66.63976 L 40,-80.04899 v 36.97694 l -17.86802,5.68877 V 29.66283 L 40,24.78675 v 36.97694 l -17.86802,5.28242 v 62.98271 H 15.22843 V 69.07781 l -30.862948,8.93948 V 141 h -6.903553 V 80.45534 L -40,85.73775 v -36.5706 l 17.461929,-5.68877 V -24.38041 L -40,-18.69164 v -37.38328 l 17.461929,-5.28243 v -68.67147 h 6.903553 v 66.23343 z M -15.634518,-26.4121 V 41.44669 L 15.22843,32.50721 v -68.26514 z\"\
       stroke=\"none\"\
/>\
<path ng-repeat=\"f in key.flats\" ng-attr-transform=\"translate({{params.keyStart+$index*100}},{{f.y1}})\" \
  d=\"m -26.333333,-35.147513 c 10.666667,-5.341617 18,-9.013974 30.999998,-9.013974 8.666674,0 11.666668,1.001553 17.999999,4.340063 4.333336,2.336956 8.000012,6.677019 9.000004,12.686332 L 33,-18.788813 C 33,-9.440991 27.666672,0.24069 17.999996,10.923914 10.333334,19.270193 4.999995,25.613354 -3.666666,33.625785 L -33,60 v -215 h 6.666667 z m 23.333334,1.335402 c -10.666667,0 -16,3.33851 -23.333334,9.681681 V 40.636652 C -16,30.287276 -8.333333,20.939443 -2.666666,12.593174 4.333334,1.9099396 8,-7.104035 8,-15.450304 c 0,-3.004661 0.333331,-5.341617 0.333331,-6.677019 0,-4.673911 -0.999992,-7.010877 -3.666666,-10.015528 l -2.666664,-1.001554 z\"\
  stroke=\"none\"\
/>\
<path ng-repeat=\"f in key.flats\" ng-attr-transform=\"translate({{params.keyStart+$index*100}},{{f.y2}})\" \
  d=\"m -26.333333,-35.147513 c 10.666667,-5.341617 18,-9.013974 30.999998,-9.013974 8.666674,0 11.666668,1.001553 17.999999,4.340063 4.333336,2.336956 8.000012,6.677019 9.000004,12.686332 L 33,-18.788813 C 33,-9.440991 27.666672,0.24069 17.999996,10.923914 10.333334,19.270193 4.999995,25.613354 -3.666666,33.625785 L -33,60 v -215 h 6.666667 z m 23.333334,1.335402 c -10.666667,0 -16,3.33851 -23.333334,9.681681 V 40.636652 C -16,30.287276 -8.333333,20.939443 -2.666666,12.593174 4.333334,1.9099396 8,-7.104035 8,-15.450304 c 0,-3.004661 0.333331,-5.341617 0.333331,-6.677019 0,-4.673911 -0.999992,-7.010877 -3.666666,-10.015528 l -2.666664,-1.001554 z\"\
  stroke=\"none\"\
/>\
<!-- głosy -->\
<g ng-repeat='vc in voices' ng-attr-transform='translate({{params.voiceWidth*$index+params.voiceStart}},0)'>\
<g class='prange_bar' ng-repeat='bar in vc.bars' ng-attr-transform=\"translate({{params.barMargin}},0)\">\
<title>{{bar.note}}</title>\
<rect x=\"0\" ng-attr-y=\"{{bar.ypos + 2 - 25}}\" ng-attr-width=\"{{bar.n*params.barScale}}\" height=\"46\"/>\
</g>\
<!-- linie dodatkowe -->\
<line ng-if=\"vc.lineMiddleC\" x1=\"-90\" y1=\"500\" x2=\"90\" y2=\"500\" />\
<line ng-repeat=\"y in vc.linesTop\" x1=\"-90\" ng-attr-y1=\"{{y}}\" x2=\"90\" ng-attr-y2=\"{{y}}\" />\
<line ng-repeat=\"y in vc.linesBottom\" x1=\"-90\" ng-attr-y1=\"{{y}}\" x2=\"90\" ng-attr-y2=\"{{y}}\" />\
<!-- prostokąty -->\
<g class='prange_bar' ng-attr-transform=\"translate(0,{{vc.maxpitch.ypos}})\">\
<title>{{vc.maxpitch.note}}</title>\
<path\
     d=\"M -60,14.66165 C -60,-10.90226 -32.101912,-50 16.433118,-50 c 25.22293,0 43.56688,13.909774 43.56688,35.71429 C 59.999998,17.29323 19.490438,50 -23.312102,50 -47.770702,50 -60,38.7218 -60,14.66165 Z\"\
/>\
</g>\
<!-- nuty -->\
<g class='prange_bar' ng-attr-transform=\"translate(0,{{vc.minpitch.ypos}})\">\
<title>{{vc.minpitch.note}}</title>\
<path\
     d=\"M -60,14.66165 C -60,-10.90226 -32.101912,-50 16.433118,-50 c 25.22293,0 43.56688,13.909774 43.56688,35.71429 C 59.999998,17.29323 19.490438,50 -23.312102,50 -47.770702,50 -60,38.7218 -60,14.66165 Z\"\
/>\
</g>\
<g class='prange_bar' ng-attr-transform=\"translate(0,{{vc.median.ypos}})\">\
<title>{{vc.median.note}}</title>\
<path\
   d=\"m 44.70064,-22.592592 c 0,-8.148148 -6.28026,-14.444445 -15.88535,-14.444445 -4.43313,0 -9.6051,1.111112 -15.1465,3.703704 -31.40127,15.925926 -60.95542,34.8148145 -60.95542,57.777777 1.84714,9.25926 5.5414,11.851852 18.10192,11.851852 C -4.43312,32.222222 44.70064,1.1111111 44.70064,-22.592592 Z M -58,14.444445 C -58,-10.74074 -31.03185,-50 15.88535,-50 40.26752,-50 58,-35.555555 58,-14.074074 58,17.037037 18.84076,50 -22.53504,50 -46.17835,50 -58,38.148148 -58,14.444445 Z\"\
/>\
</g>\
<!-- głosy -->\
<text ng-attr-transform=\"translate({{params.barMargin}},{{params.voiceNameY}})\" ng-attr-fill=\"{{vc.color}}\" stroke=\"none\" ng-attr-font-size=\"{{params.fontSize}}\" style=\"font-family:serif\">{{vc.name}}</text>\
</g>\
</svg>"
    };
  })

  .directive('proll', function(humFile, humExtras, humConvert, humConst) {
    return {
      restrict: 'E',
      scope: {
        krnFile: '='
      },
      link: function($scope, $element) {

        var canvases = $element.find("canvas"),
          noteW = 8,
          noteG = 2,
          minNote = 8,
          width,
          height,
          keyboardW = 40,
          i,
          y,
          r;

        $scope.$watch('krnFile', function(nv) {
          if (!nv) return;
          var hum = nv,
            proll = humExtras.proll(hum),
            context = canvases[0].getContext('2d'),
            keyboardContext = canvases[1].getContext('2d');

          function keyY(key) {
            let o = Math.floor(key / 12),
              h = key % 12;
            return o * 14 + ((h > 4) ? h + 1 : h);
          }

          function noteY(key) {
            return height - noteW / 2 - (keyY(key) - keyY(proll.minKey)) * (noteW + noteG);
          }

          function posX(pos) {
            return pos * minNote * noteW;
          }

          height = canvases[0].height = canvases[1].height = (noteW + noteG) * (keyY(proll.maxKey) - keyY(proll.minKey) + 1);
          width = canvases[0].width = noteW * (proll.totalDuration.toFloat() * 8) + keyboardW;
          canvases[1].width = keyboardW;

          context.fillStyle = 'white';
          context.fillRect(0, 0, width, height);
          context.setLineDash([1, 3]);
          context.strokeStyle = 'silver';
          context.lineWidth = 0;
          for (i = proll.minKey; i <= proll.maxKey; i++) {
            y = noteY(i);
            context.strokeRect(keyboardW, y, width - keyboardW, 0);
          };

          for (i = 0; i < hum.getNumLines(); i++) {
            r = hum.getLine(i);
            if (r.type === humConst.E_humrec_data_measure) {
              context.strokeRect(posX(r.AbsBeatR.toFloat()) + keyboardW, 0, 0, height);
            }
          };

          context.setLineDash([]);
          context.lineWidth = 0;
          context.strokeStyle = "black";
          context.fillStyle = "black";
          context.strokeRect(keyboardW, 0, 0, height);
          for (i = proll.minKey; i <= proll.maxKey; i++) {
            let h = keyY(i) % 14;
            if (h === 5) continue;
            if (h % 2 === 1) {
              context.fillRect(-1, noteY(i) - noteW, keyboardW * 2 / 3, noteW * 2);
            } else {
              context.strokeRect(-1, noteY(i) - (noteW + noteG), keyboardW, 0);
            };
          };

          //copy keyboard
          keyboardContext.drawImage(canvases[0], 0, 0, keyboardW, canvases[1].height, 0, 0, keyboardW, canvases[1].height);

          proll.voices.reduce(function(p, v, i) {
            var color = humConvert.voiceToColor(i - 1, proll.voices.length - 1);
            context.fillStyle = color;
            v.notes.reduce(function(p, n, j) {
              context.fillRect(posX(n.positionR.toFloat()) + keyboardW, noteY(n.pitch) - noteW / 2, posX(n.durationR.toFloat()) - 1, noteW);
            }, null);
          }, null);

          $scope.voices = proll.voices;

          $scope.openData = function() {
            window.open(canvases[0].toDataURL(), "_blank");
          };
        });

      },
      template: "<div style='position:relative'>\
<div style='padding:0 0; width:100%; overflow-x:auto; display:inline-block'>\
<canvas></canvas>\
</div>\
<canvas style='position:absolute;top:0;left:0'></canvas>\
</div>\
<p class='text-right small' ng-show='krnFile'><a href ng-click='openData()'>Otwórz w nowym oknie</a></p>"
    }
  })

  .directive('mkeyscape', function(humFile, humExtras, humConvert) {

    var colorToKey = {
      '#00ff00': 'C dur',
      '#26ff8c': 'C♯/D♭ dur',
      '#3f5fff': 'D dur',
      '#e41353': 'E♭ dur',
      '#ff0000': 'E dur',
      '#ffff00': 'F dur',
      '#c0ff00': 'F♯/G♭ dur',
      '#5dd3ff': 'G dur',
      '#8132ff': 'A♭ dur',
      '#cd29ff': 'A dur',
      '#ffa000': 'H♭ dur',
      '#ff6e0a': 'H dur',

      '#00a100': 'c moll',
      '#0fbf5a': 'c♯ moll',
      '#253db5': 'd moll',
      '#b81b4b': 'd♯/e♭ moll',
      '#af0000': 'e moll',
      '#dcc800': 'f moll',
      '#8cc800': 'f♯ moll',
      '#41a3b5': 'g moll',
      '#641cb5': 'a♭ moll',
      '#880db5': 'a moll',
      '#b55d14': 'h♭ moll',
      '#d36b00': 'h moll'
    };

    return {
      restrict: 'E',
      scope: {
        krn: '='
      },
      link: function($scope, $element) {

        var canvas = $element.find("canvas")[0],
          Module = {
            TOTAL_MEMORY: 64 * 1024 * 1024
          };

        mkeyscape_main(Module);

        function mousePos(event) {
          var rect = canvas.getBoundingClientRect();
          return {
            x: Math.round((event.clientX - rect.left) / (rect.right - rect.left) * canvas.width),
            y: Math.round((event.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height)
          }
        };

        $scope.showKey = function(event) {
          var context, pos, pixel, hex, desc;
          if (event) {
            pos = mousePos(event);
            context = canvas.getContext('2d');
            pixel = context.getImageData(pos.x, pos.y, 1, 1).data;
            hex = "#" + ("000000" + ((pixel[0] << 16) | (pixel[1] << 8) | pixel[2]).toString(16)).slice(-6);
            desc = colorToKey[hex];
            if (desc) {
              $scope.keyDescription = desc;
              $scope.keyColor = hex;
              return;
            }
          }
          $scope.keyDescription = undefined;
        }

        $scope.$watch('krn', function(nv) {

          var output = "",
            context,
            imageData,
            startIndex = 4,
            imgW = 600, //expected images w and h
            imgH = 461,
            pyramidH = 310, //expected coordinates
            keysY = 340,
            keysX = 120,
            keysW = 360,
            w,
            h;

          function copyPPMToImageData(dstX, dstY, srcX, srcY, srcW, srcH) {
            var x,
              y,
              r, g, b,
              srcI,
              dstI;

            for (y = 0; y < srcH; y = y + 1) {
              //line indexes
              srcI = ((srcY + y) * w + srcX) * 3;
              dstI = ((dstY + y) * canvas.width + dstX) * 4;

              for (x = 0; x < srcW; x = x + 1) {
                r = parseInt(output[srcI + 0 + startIndex]);
                g = parseInt(output[srcI + 1 + startIndex]);
                b = parseInt(output[srcI + 2 + startIndex]);

                imageData.data[dstI + 0] = r;
                imageData.data[dstI + 1] = g;
                imageData.data[dstI + 2] = b;
                imageData.data[dstI + 3] = (r + g + b === 255 * 3) ? 0 : 255;

                srcI = srcI + 3;
                dstI = dstI + 4;
              };
            }
          }

          if (!nv) return;

          FS.createDataFile('/', 'stdin', nv, true, true);
          Module['arguments'] = ['-ln', 'stdin'];
          Module['print'] = function(x) {
            output += x + '\n'
          };
          Module.run();

          //remove end
          output = output.replace(/exit\(\d\) called\s*/, '');
          output = output.split(/\s+/);

          //quit if not ppm or error
          if ((output[0] !== 'P3') && (output[4] !== '255')) return;

          w = parseInt(output[1]);
          h = parseInt(output[2]);

          //scale
          keysX = Math.floor(keysX * w / imgW);
          keysY = Math.floor(keysY * h / imgH);
          keysW = Math.floor(keysW * w / imgW);
          pyramidH = Math.floor(pyramidH * h / imgH);

          canvas.width = w + keysW;
          canvas.height = pyramidH;

          context = canvas.getContext('2d');
          imageData = context.createImageData(canvas.width, canvas.height);

          copyPPMToImageData(0, 0, 0, 0, w, pyramidH);
          copyPPMToImageData(w, Math.floor((pyramidH - (h - keysY)) / 2), keysX, keysY, keysW, h - keysY);

          context.putImageData(imageData, 0, 0);
        });
      },
      template: "<div style='position: relative; margin: 0 0; padding: 0 0; border: 0; width:100%'>\
<canvas ng-mousemove='showKey($event)' ng-mouseout='showKey(null)' style='width:100%'></canvas>\
<span style='position:absolute; left:0; top:0;line-height:30px; font-size:20px; text-shadow: 0px 0px 2px black' ng-style='{color:keyColor}'>{{keyDescription}}</span>"
    };
  });
