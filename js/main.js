        var POK = POK || {};
        POK.pokemons_list = [];
        POK.chunk_size = 12;
        POK.url = {};
        POK.url.server = "http://pokeapi.co";
        POK.url.next_chunk = POK.url.server + "/api/v1/pokemon/?limit=" + POK.chunk_size;
        POK.url.all_types = POK.url.server + "/api/v1/type/?limit=999";
        POK.url.img = POK.url.server + "/media/img/";
        POK.pokemons = {};
        POK.types = {};
        POK.types_list = [];
        POK.filtered_types_list = []; 
        POK.types.btn_class = {};
                       

        $(document).ready(function(){
            POK.init();
            $("#process").click(function(){
              POK.get_chunk()
              }
            );
          }
        );

        POK.get_all_types = function (){  
            $('#thumbnails_box').block({ message: "Filter preparation...", css: { backgroundColor: '#3A7DE8', color: '#fff'} }); //29
            $.getJSON(POK.url.all_types)
            .done(function(data){
                $.each(data.objects, 
                  function(i, object){
                    var cur_type = object.name.toLowerCase();
                    POK.types_list.push(cur_type);
                    POK.types.btn_class[cur_type] = "btn-" + cur_type;
                  }
                )
                $("#filter-tag-list").tags({
                    suggestions: POK.types_list,
                    restrictTo: POK.types_list
                });  
                $('#thumbnails_box').unblock(); 
      
             }
            ) 
        }

        POK.show_pok_details = function(pokemon_id){
          var selected_pok = POK.pokemons[pokemon_id.toString()];
          var tmpl = $("#details_template").html();

          $("#img_details").attr("src",selected_pok.img_src);
          $("#cur_pokemon_name").html(selected_pok.name);
          $("#cur_pokemon_id").html('#'+('000' + selected_pok.id).substr(-3));
          $("#table_box").html(Mustache.render(tmpl,selected_pok));

          $("#cur_pokemon").show() 
        }
        
        POK.define_pok_visibility = function(){
          var index = -1; 
          if (POK.pokemons_list.length > 0) {
            //check filter conditions and set all to unvisible
            _.each(POK.pokemons_list,POK.filtering);
            //iterates the array in reverse
            for (var i = 1; i <= POK.chunk_size; i++) {
              index = _.findLastIndex(POK.pokemons_list,{filtered: true, visible: false});
              if (index >= 0) {
                POK.pokemons_list[index].visible = true; 
              } else {
                break;
              }
            }
          }

        }
        

        POK.show_thumbnails = function (){
          POK.define_pok_visibility();

          $('#thumbnails_box').spin(false)
          $('#thumbnails_box').unblock(); 

          
          var thumb_tmpl = Handlebars.compile($("#thumbnails_template").html());
          
          Handlebars.registerHelper("makeTypeButton", function(tipes, options){
             var str = options.fn(this).trim();
             var button_class = "btn btn-secondary"; 
             if (_.has(tipes.btn_class, str)) {
                 button_class = tipes.btn_class[str];
             };
             return "<div class='btn " + button_class + " text-center'>" + str + "</div>";
          });
          
          Handlebars.registerHelper("areEqual", function(num1, num2, options){
              if(num1 === num2) {
                return options.fn(this);
              } else {
                return options.inverse(this);
              }          
          });
          $("#thumbnails").html(thumb_tmpl(POK));
        }
        
        POK.pass_filter = function (cur_pok){
          var cur_pok_types = [],
              dif = [];
          if (typeof POK.filtered_types_list !== 'undefined' && POK.filtered_types_list.length > 0) {
            if (_.has(cur_pok, "type_set")) {
              cur_pok.type_set.forEach( function(cur_pok_type){
                  cur_pok_types.push(cur_pok_type.type_name)  
                  }
              )
            };
            dif = _.difference(POK.filtered_types_list,cur_pok_types);
            return dif.length < 1;
          } else {
            return true
          }        
        }

        POK.filtering = function(cur_pok){
          cur_pok.filtered = POK.pass_filter(cur_pok);
          cur_pok.visible = false;
        }

        POK.pok_parse = function(i, object){
          var img_src = POK.url.img+object.pkdx_id+".png";
          var type_set = [];
          var type_set_str = "";
          //types    
          for (var j = 0; j < object.types.length; j++){
            //types for thumbnail
            type_set.push( { type_name: object.types[j].name } );
            //types for detailed view
            type_set_str = type_set_str 
                + ((type_set_str == "") ? "" : ", ") 
                + object.types[j].name.capitalizeFirstLetter();
          }

          POK.pokemons_list.push( { 
              id: object.pkdx_id,
              name: object.name,
              "img_src": img_src,
              "type_set": type_set,
              filtered: false, //pass filter
              visible: false //pass filter and get in group of 12
            }
          )
          //data for detailed view
          POK.pokemons[object.pkdx_id.toString()] = {
               id: object.pkdx_id,
               name: object.name,
               "img_src": img_src,
               charact_set: [ { name: "Type",
                               value: type_set_str }, 
                              { name: "Attack",
                               value: object.attack }, 
                              { name: "Defense",
                               value: object.defense },
                              { name: "HP",
                               value: object.hp },
                              { name: "SP Attack",
                               value: object.sp_atk },
                              { name: "SP Defense",
                               value: object.sp_def },
                              { name: "Speed",
                               value: object.speed }, 
                              { name: "Weight",
                               value: object.weight },
                              { name: "Total moves",
                               value: object.moves.length }
                            ]
          }
        }

        POK.get_chunk = function(){
            $('#thumbnails_box').block({ message: null, css: { backgroundColor: '#E7C9E5', color: '#fff'} }); //29
            $('#thumbnails_box').spin("modal");
            $("#cur_pokemon").hide(); 
            console.log(POK.url.next_chunk)
            $.getJSON(POK.url.next_chunk)
            .done(function(data){
                POK.url.next_chunk = POK.url.server + data.meta.next
                $(".pok_type").remove();
                $(".thumbnail").off('click', POK.show_pok_details);
                $.each(data.objects, POK.pok_parse);
                POK.show_thumbnails();
              } 
            )
        }
        
        POK.init = function(){
            $("#cur_pokemon").hide(); 
            POK.get_all_types();
        }
        
        String.prototype.capitalizeFirstLetter = function() {
            return this.charAt(0).toUpperCase() + this.slice(1);
        }
