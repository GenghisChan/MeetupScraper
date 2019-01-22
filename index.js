const rp = require('request-promise');
const cheerio  = require('cheerio');
const Table = require('cli-table');

let users = [];
let table = new Table({
  head: ['id','name', 'title', 'company', 'reason'],
  colWidths: [5, 15, 30, 30, 60]
})

const options = {
  url: `https://www.meetup.com/mu_api/urlname/events/eventId/attendees?queries=%28endpoint%3AHackerNestNYC%2Fevents%2Fdllqmqyzcbcc%2Frsvps%2Cmeta%3A%28method%3Aget%29%2Cparams%3A%28desc%3A%21t%2Cfields%3A%27answers%2Cpay_status%2Cself%2Cweb_actions%2Cattendance_status%27%2Conly%3A%27answers%2Cresponse%2Cattendance_status%2Cguests%2Cmember%2Cpay_status%2Cupdated%27%2Corder%3Atime%29%2Cref%3AeventAttendees_HackerNestNYC_dllqmqyzcbcc%2Ctype%3Aattendees%29`,
  json: true
}

rp(options)
.then((data) => {
  let userData = [];

  for (let member of data.responses[0].value) {
    if(member.response == "yes"){
      userData.push({id: member.member.id, name: member.member.name});
    }
    else {
      continue
    }
  }
  process.stdout.write('loading');
  console.log(userData.length)
  getUserIntention(userData);
})
.catch((err) => console.log(err))

const getUserIntention = (userData) => {
  var i = 0;
  const next = () => {
    if (i < userData.length){
      var options = {
        url: `https://www.meetup.com/HackerNestNYC/members/${userData[i].id}`,
        transform: body => cheerio.load(body)
      }
      rp(options)
        .then(function ($) {
          process.stdout.write('.')
          const title = $("#D_memberProfileQuestions .D_memberProfileContentItem:nth-child(3) p").text()
          const company = $("#D_memberProfileQuestions .D_memberProfileContentItem:nth-child(4) p").text()
          const reason = $("#D_memberProfileQuestions .D_memberProfileContentItem:nth-child(6) p").text()

          table.push([i, userData[i].name, title, company, reason])
          ++i;
          return next();
        })
    } else {
        printData();
    }
  }
  return next();
};

const printData = () => {
  console.log("✅")
  console.log(table.toString());
}
