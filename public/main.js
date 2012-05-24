$(document).ready(function(){

    var setGame = function(game){
	$('#field_game').val(game);
	hideThese(['#games', '#form_match']);
	showThese(['#match_types']);
	var match_type = $('#field_match_type').val();
	if(match_type)
	    setMatchType(match_type);
    };

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
	$('input[type="email"]').autocomplete({source:getFriends()});
    }
    var game = $('#field_game').val();
    if((match_type)&&(match_type!='')){
	setGame(game);
    }

    var match_type = $('#field_match_type').val();
    if((match_type)&&(match_type!='')){
	setMatchType(match_type);
    }

    $('#match_types div').click(function(){
	var match_type = $(this).attr('data-value');
	setMatchType(match_type);
    });
    $('#games div').click(function(){
	var game = $(this).attr('data-value');
	setGame(game);
    });

});

//friends is an array of friend emails
setFriends = function(addThese){
    var friends = getCookie('friends');
    if(!friends){
	friends=[]
    }else{
	friends = friends.split('::');
    }
    for(var i = 0 ; i<addThese.length; i++){
	var friend = addThese[i];
	if(!utils.inArray(friend, friends))
	    friends.push(friend);
    }
    friends = friends.join('::');
    setCookie('friends', friends, 9999999);
};

getFriends = function(){
    var friends = getCookie('friends');
    if(!friends)
	return [];
    return friends.split('::');
}