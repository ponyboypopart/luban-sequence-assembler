/*

LuBan Sequence Assembler

by Mark Brown (aka @PonyBoyPopArt) 

December 2024

*/

$(document).ready( function(){


	window.LuBan = {
	
		Reset: function()
		{
			$('div#DEBUG').html('');
			$('div#WARNINGS').html('');
			$('div#OUTPUT').html('<h1>Assembly</h1><ol id="STEPS"></ol>').hide();
			
			this.Parts = new Array();
			this.Assemblage = new Array();
			this.Groups = new Array();
			this.AssembleIndex = 0;
			this.MaxGroup = 0;
			this.numTiny = 0;
			this.numParts = 0;
			this.numPieces = 0;
		},	

		LogDebug: function(str)
		{
		
			$('div#DEBUG').append($('<div>').html(str));
		
		},

		LogAssemblyStep: function(groupParts)
		{			
			if ((groupParts != null) && (groupParts != undefined) && (groupParts.length))
			{
				var $STEPS = $('ol#STEPS', $('div#OUTPUT').show());
				var stepText = 'Assemble: ';
				for (var i=0; i<groupParts.length; i++)
				{
					/* NOTE: WE ARE CURRENTLY SIMPLY LOOPING IN ORDER, BUT SHOULD BE BY SEQUENCE */
					var part = groupParts[i];
					stepText += (i!=0?' and ':'') + '<b>' + part.Name + '</b>';
				}
				var $STEP = $('<li></li>').html(stepText)
				$STEPS.append($STEP);
			
			}		
		},

		ReportDiscarded: function(line)
		{
			var $warning = $('<span>').text(line);
			var $container = $('<div>');
			$container.append('<span>IGNORED: </span>')
			$container.append($warning)
			$('div#WARNINGS').append($container)
		},


		LoadSequence: function()
		{
			this.Reset();
			var params = {noTiny: $('input#NO_TINY').is(':checked')};
			var sourceText = $('textarea').val().trim();
			var sourceLines = sourceText.split('\n');

			for(var i=0; i<sourceLines.length;i++)
			{
				var line = sourceLines[i];
				var lineParts = line.split(':');
				if (lineParts.length == 2)
				{
					var Part = { 
									Name: lineParts[0], 
									Number: (lineParts[0].substr( lineParts[0].indexOf('_')+1)), 
									RawSequencce: lineParts[1],
									Sequence: lineParts[1].split(','), 
									isTiny: (lineParts[0].indexOf('Tiny_')==0), 
									ShortName: lineParts[0][0] + (lineParts[0].substr( lineParts[0].indexOf('_')+1)), 
								};
					Part.Group = Number(Part.Sequence[0]);

					if (Part.Group > this.MaxGroup)
					{
						this.MaxGroup = Part.Group;
					}

					var isValid = false;
					if (Part.isTiny)
					{
						if ( ! params.noTiny )
						{
							this.numTiny++
							isValid = true;
						}
					}
					else
					{
						this.numParts++;
						isValid = true;
					}
					if (isValid)
					{
						this.numPieces++;
						this.Parts.push(Part);

						if ((this.Groups['GRP_' + Part.Group] == undefined)||(this.Groups['GRP_' + Part.Group] == null))
							this.Groups['GRP_' + Part.Group] = new Array();
						this.Groups['GRP_' + Part.Group].push(Part);
					}
				}
				else
				{
					this.ReportDiscarded(line);
				}			
			}


			this.LogDebug("Total Pieces: " + (this.numPieces) + (this.numTiny==0?'':"  ( " + this.numTiny + " Tiny + " + this.numParts + " Parts )"));

			this.LogDebug('Top Level Groups: ' + (this.MaxGroup + 1) + '</div>');
		},


		Build: function()
		{
			this.LoadSequence();
			this.Assemble(this.Parts);
		},

		Assemble: function(partSubList, lvl = 0)
		{
			if ((partSubList != undefined) && (partSubList != null) && (partSubList.length))
			{
				/* First simply get the largest group number for this subset and at this level */
				var maxGrp = this.GetMaxGroupNumber(partSubList, lvl);
				var BuildList = this.GetBuildList(partSubList, lvl, maxGrp);	
				
				for(var c=0; c<BuildList.length; c++)
				{
					this.Assemble(BuildList[c], lvl+1);
				}
							
				if (partSubList.length > 1)
						this.LogAssemblyStep(partSubList);
			}			
		},


		GetMaxGroupNumber: function(partSubList, lvl)
		{
			var maxGrp = 0;
			for(var p=0;p<partSubList.length;p++)
			{
				thisG = Number(partSubList[p].Sequence[lvl]);
				if (thisG>maxGrp)
				{
					maxGrp = thisG;					
				}
			}
			return maxGrp;
		},

		GetBuildList: function(partSubList, lvl, maxGrp)
		{
			var BuildList = new Array();
			for (var g=0; g<=maxGrp; g++)
				BuildList.push(new Array());

 			for (var p=0; p<partSubList.length; p++)
			{
				thisG = Number(partSubList[p].Sequence[lvl]);
				if ((thisG != null)&&(thisG != undefined)&&( ! isNaN(thisG) ))
				{
					try
					{
						BuildList[thisG].push(partSubList[p]);				
					}
					catch(e)
					{
						alert(thisG);
						alert(e);
					}
				}
			}
			
			return BuildList;
		},




		About: function()
		{ 
			alert('LuBan Sequence Assembler\n\nby Mark Brown\naka @PonyBoyPopArt\nDec 2024');
		}

	/* /LuBan */
	};
	


	// RUN IMMEDIATELY
	LuBan.Build();
});
