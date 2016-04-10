$(function(){
    $("#filter-tag-list").tags({
      tagSize: "sm",
      suggestions: POK.types_list,
      //restrictTo: types_list,
      tagData: POK.filtered_types_list,
      caseInsensitive: true,
      suggestOnClick: true,
      maxNumTags: 2,  
      promptText: "Enter type...",
      //tagClass: 'label label-success', 
      afterAddingTag: function(tag){ POK.show_thumbnails(); },
      afterDeletingTag: function(tag){ POK.show_thumbnails(); }

    });
   }
 );

