import "jquery";
import "select2";

$(document).ready(function() {
  console.log('SELECT2_LOADED')
  $('#keyword_filter_group_name').select2({
    placeholder: 'Select an option', // Optional: placeholder text
    allowClear: true // Optional: allow clear
  });
})
