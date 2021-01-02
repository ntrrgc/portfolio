$(function() {
  $('.search-form').on('submit', function() {
    var query = 'site:gamematicas.com ' + $('#search-query').val();
    $('.search-form input[name="q"]').val(query);
  });
});