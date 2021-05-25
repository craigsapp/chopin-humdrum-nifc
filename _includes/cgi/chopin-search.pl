#!/usr/bin/perl
##
## Programmer:    Craig Stuart Sapp <craig@ccrma.stanford.edu>
## Creation Date: Mon 24 May 2021 09:03:38 AM PDT
## Last Modified: Mon 24 May 2021 09:03:42 AM PDT
## Filename:      /var/www/cgi-bin/chopin-search
## Syntax:        Perl 5; CGI
## $Smake:        cp -f %f /var/www/cgi-bin/%b
## vim:           ts=3
##
## Description:   This programs searches through the music of Chopin.
##

my $indexfile = "chopin.tindex";
my $searchdir = "/project/chopin-nifc/krn";
my $kerndir   = $searchdir;
my $themax    = "/usr/local/bin/themax";
#my $theloc    = "/usr/local/bin/theloc";

###########################################################################

use strict;
use URI::Escape;

use CGI;
my $cgi_form = new CGI;

my %OPTIONS;

$OPTIONS{'pitch'}    = $cgi_form->param('pitch');
$OPTIONS{'interval'} = $cgi_form->param('interval');
$OPTIONS{'rhythm'}   = $cgi_form->param('rhythm');

$OPTIONS{'pitch'}    = uri_unescape($OPTIONS{'pitch'});
$OPTIONS{'interval'} = uri_unescape($OPTIONS{'interval'});
$OPTIONS{'rhythm'}   = uri_unescape($OPTIONS{'rhythm'});

$OPTIONS{'pitch'}    =~ s/N/n/g;
$OPTIONS{'pitch'}    =~ s/\*/./g;
$OPTIONS{'rhythm'}   =~ s/0/B/gi;
$OPTIONS{'rhythm'}   =~ s/9/L/gi;

my $results;
if (($OPTIONS{'pitch'}   =~ /^\s*$/) &&
   ($OPTIONS{'interval'} =~ /^\s*$/) &&
   ($OPTIONS{'rhythm'}   =~ /^\s*$/)) {
	
	$results = glob("*.krn");
} else {
	$results = doSearch(%OPTIONS);
}

print "Content-Type: text/plain\n";
print "\n";
print "$results";

exit(0);

###########################################################################


##############################
##
## createThemaxOptions -- create the themax option list for searching.
##

sub createThemaxOptions {
	my %opts = @_;

	my $output;

	$opts{'pitch'} =~ s/[\\;\/\`\"\']//g;
	if ($opts{'pitch'} !~ /^\s*$/) {
		$output .= " -p \"$opts{'pitch'}\"";
	}

	$opts{'interval'} =~ s/[\\;\/\`\"\']//g;
	if ($opts{'interval'} !~ /^\s*$/) {
		$output .= " -I \"$opts{'interval'}\"";
	}

	$opts{'rhythm'} =~ s/[\\;\/\`\"\']//g;
	if ($opts{'rhythm'} !~ /^\s*$/) {
		my $rhythm = $opts{'rhythm'};
		$rhythm =~ s/\./z/g;
		$rhythm =~ s/(.)(?=.)/$1 /g;
		$rhythm =~ s/\s\././g;
		$rhythm =~ s/\s+/ /g;
		$rhythm =~ s/^\s+//;
		$rhythm =~ s/\s+$//;
		$rhythm =~ tr/lbDdWwHhQqEe/LBBB11224488/;
		$rhythm =~ s/ z/d/g;
		$output .= " -u \"$rhythm\"";
	}

	return $output;
}



##############################
##
## doSearch --
##

sub doSearch {
	my %opts = @_;

	my $options = createThemaxOptions(%opts);

	my $results;

	my $command = "$themax $options $searchdir/$indexfile ";
	# my $command = "$themax $options $searchfile --location ";
	# $command .= " | $theloc -p $kernpath";
	print STDERR "COMMAND: $command\n";
	$results .= `$command`;

	my @data = split(/\n/, $results);
	chomp @data;
	my @newdata;
	my $lastfile;
	for (my $i=0; $i<@data; $i++) {
		my $newfile = $data[$i];
		$newfile =~ s/\.krn.*$/.krn/;
		next if $newfile eq $lastfile;
		$newdata[@newdata] = $newfile;
		$lastfile = $newfile;
	}
	$results = join("\n", @newdata) . "\n";
	return $results;
}


