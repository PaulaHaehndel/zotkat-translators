{
	"translatorID": "a5d5ca83-b975-4abe-86c9-d956d7b9c8fa",
	"label": "Open Journal Systems Standard",
	"creator": "Timotheus Kim",
	"target": "article|issue/view/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": false,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2020-08-25 17:27:17"
}

/*
    ***** BEGIN LICENSE BLOCK *****
    Copyright © 2020 Universitätsbibliothek Tübingen.  All rights reserved.
    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.
    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.
    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
    ***** END LICENSE BLOCK *****
*/

function detectWeb(doc, url) {
    if (url.match(/\/issue\/view/) && getSearchResults(doc)) return "multiple";
}

function getSearchResults(doc) {
    var items = {};
    var found = false;
    var rows = ZU.xpath(doc, '//*[contains(concat( " ", @class, " " ), concat( " ", "media-heading", " " ))]//a | //*[contains(concat( " ", @class, " " ), concat( " ", "title", " " ))]//a | //a[contains(@href, "/article/view/") and not(contains(@href, "/pdf"))]');
    for (let row of rows) {
        let href = row.href;
        let title = ZU.trimInternal(row.textContent);
        if (!href || !title) continue;
        found = true;
        items[href] = title;
    }
    return found ? items : false;
}

function invokeEMTranslator(doc) {
    var translator = Zotero.loadTranslator("web");
    translator.setTranslator("951c027d-74ac-47d4-a107-9c3069ab7b48");
    translator.setDocument(doc);
    translator.setHandler("itemDone", function (t, i) {
    	if (i.pages.match(/^\d{1,3}–\d{1,3}-\d{1,3}–\d{1,3}/)) {
			let firstandlastpages = i.pages.split('–');
			i.pages = firstandlastpages[0] + '-' + firstandlastpages[2] ; // Z.debug(item.pages)
		}
	if (i.issue === "0") delete i.issue;
        i.complete();
    });
    translator.translate();
}

function doWeb(doc, url) {
    if (detectWeb(doc, url) === "multiple") {
        Zotero.selectItems(getSearchResults(doc), function (items) {
            if (!items) {
                return true;
            }
            var articles = [];
            for (var i in items) {
                articles.push(i);
            }
            ZU.processDocuments(articles, invokeEMTranslator);
        });
    } else
        invokeEMTranslator(doc, url);
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://ojs.reformedjournals.co.za/stj/issue/view/70",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://ojs.reformedjournals.co.za/stj/article/view/1969",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "“The message to the people of South Africa” in contemporary context: The question of Palestine and the challenge to the church",
				"creators": [
					{
						"firstName": "Mark",
						"lastName": "Braverman",
						"creatorType": "author"
					}
				],
				"date": "2019",
				"DOI": "10.17570/stj.2019.v5n3.a01",
				"ISSN": "2413-9467",
				"abstractNote": "In September 2018 John de Gruchy presented a paper at the Volmoed Colloquium entitled “Revisiting the Message to the people of South Africa,” in which he asks, “what is the significance of the document for our time?” In this expanded version of the author’s response to de Gruchy, two further questions are pursued: First: how can the churches today meet the challenge of today’s global system of economically and politically-driven inequality driven by a constellation of individuals, corporations, and governments? Second: in his review of church history, de Gruchy focused on the issue of church theology described in the 1985 Kairos South Africa document, in which churches use words that purport to support justice but actually serve to shore up the status quo of discrimination, inequality and racism. How does church theology manifest in the contemporary global context, and what is the remedy? The author proposes that ecumenism can serve as a mobilizing and organizing model for church action, and that active engagement in the issue of Palestine is an entry point for church renewal and for a necessary and fruitful exploration of critical issues in theology and ecclesiology.",
				"issue": "3",
				"journalAbbreviation": "STJ",
				"language": "en",
				"libraryCatalog": "ojs.reformedjournals.co.za",
				"pages": "13-40",
				"publicationTitle": "STJ | Stellenbosch Theological Journal",
				"rights": "Copyright (c) 2020 Pieter de Waal Neethling Trust, Stellenbosch",
				"shortTitle": "“The message to the people of South Africa” in contemporary context",
				"url": "https://ojs.reformedjournals.co.za/stj/article/view/1969",
				"volume": "5",
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					},
					{
						"title": "Snapshot",
						"mimeType": "text/html"
					}
				],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
