$(document).ready(function(){
    var setMatchType = function(match_type){
	$('#field_match_type').val(match_type);
	$('#form_match').show();
	$('#match_types').hide();
	if(match_type=='1_vs_1'){
	    $('.not_teams').show();
	    $('.teams').remove();
	}else{
	    $('.not_teams').remove();
	    $('.teams').show();
	}
    }
    var match_type = $('#field_match_type').val();
    if((match_type)&&(match_type!='')){
	setMatchType(match_type);
    }
	

    $('#match_types div').click(function(){
	var match_type = $(this).attr('data-value');
	setMatchType(match_type);
    });
});