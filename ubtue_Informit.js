{
	"translatorID": "c975515d-ab3c-4baa-b631-41b7e4239b42",
	"label": "ubtue_Informit",
	"creator": "Madeesh Kannan, Paula Hähndel",
	"target": "https?://search.informit.",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2023-08-23 12:12:18"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2023 Universitätsbibliothek Tübingen.  All rights reserved.

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
	if (url.includes("toc"))
		return "multiple";
	else if (url.includes("doi")) {
		return "journalArticle";
	}
}

function getSearchResults(doc) {
	var items = {};
	var found = false;
	var rows = ZU.xpath(doc, '//div[@class="issue-item__title"]//a');
	for (let i=0; i<rows.length; i++) {
		let href = rows[i].href;
		let title = ZU.trimInternal(rows[i].textContent);
		if (!href || !title) continue;
		found = true;
		items[href] = title;
	}
	return found ? items : false;
}

function postProcess(doc, item) {
	let articleSource = ZU.xpathText(doc, '//span[contains(text(), "Source:")]/following-sibling::span[1]').trim();
	let pageMatch = articleSource.match(/(\d+-\d+)$/);
	if (pageMatch) {
		if (item.pages != pageMatch[1])
			item.pages = pageMatch[1];
	}

	let pubinfo = ZU.xpathText(doc, '//ul[@class="rlist publication-details__list"]');

	if (!item.DOI)
		item.DOI = ZU.xpathText(doc, "//span[@class='list-item-type' and contains(text(), 'DOI:')][1]/following-sibling::span[1]/a");

	if (!item.ISSN)
		item.ISSN = ZU.xpathText(doc, "//span[@class='list-item-type' and contains(text(), 'ISSN:')][1]/following-sibling::span[1]");
	if (!item.ISSN) {
		item.ISSN = pubinfo.match(/ISSN\s*:?\s*(\d{4}-\d{3}.)/)[1];
	}
	if (!item.volume) item.volume = pubinfo.match(/Vol[^\d]*(\d+)/)[1];
	if (!item.issue) item.issue = pubinfo.match(/No[^\d]*(\d+)/)[1];

	item.tags = ZU.xpath(doc, "//span[@class='list-item-type' and contains(text(), 'Subject:')][1]/following-sibling::span[1]//a")
					 .map(i => i.textContent)
	if (item.reportType == "book-review") {
		item.tags.push("RezensionstagPica");
	}
}

function invokeEmbeddedMetadataTranslator(doc, url) {
	var translator = Zotero.loadTranslator("web");
	translator.setTranslator("951c027d-74ac-47d4-a107-9c3069ab7b48");
	translator.setDocument(doc);
	translator.setHandler("itemDone", function (t, i) {
		postProcess(doc, i);
		i.attachments = [];
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
			ZU.processDocuments(articles, invokeEmbeddedMetadataTranslator);
		});
	} else
		invokeEmbeddedMetadataTranslator(doc, url);
}
/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://search.informit.org/toc/l_acr/99/4",
		"items": "multiple"
	},
	{
		"type": "web",
		"url": "https://search.informit.org/doi/10.3316/informit.815447686114521",
		"items": [
			{
				"itemType": "journalArticle",
				"title": "Then and now: Australian catholic experiences",
				"creators": [
					{
						"firstName": "Richard",
						"lastName": "Rymarz",
						"creatorType": "author"
					}
				],
				"date": "2022-10-01",
				"ISSN": "0727-3215",
				"abstractNote": "Review(s) of: Then and now: Australian catholic experiences, by Edmund Campion, (Adelaide: ATF Theology, 2021), pp. 178, paperback, $29.95.",
				"archiveLocation": "Sydney",
				"issue": "4",
				"language": "EN",
				"libraryCatalog": "search.informit.org",
				"pages": "499-500",
				"publicationTitle": "TheAustralasian Catholic Record",
				"shortTitle": "Then and now",
				"url": "https://search.informit.org/doi/abs/10.3316/informit.815447686114521",
				"volume": "99",
				"attachments": [],
				"tags": [
					{
						"tag": "RezensionstagPica"
					}
				],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
