// @ts-nocheck - This file is generated at build time
// Export precompiled template specifications only - no eval() or Function constructor usage
// Helper functions should be registered separately at runtime

export type TemplateSpec = any; // Type for precompiled template specs

export interface TemplateCollection {
  subject?: TemplateSpec;
  html?: TemplateSpec;
  text?: TemplateSpec;
}

export const certificationKeyAirdropped: TemplateCollection = {
  subject: {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "Your certification for "
    + ((stack1 = ((helper = (helper = lookupProperty(helpers,"lockName") || (depth0 != null ? lookupProperty(depth0,"lockName") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"lockName","hash":{},"data":data,"loc":{"start":{"line":1,"column":23},"end":{"line":1,"column":37}}}) : helper))) != null ? stack1 : "");
},"useData":true},
  html: {"1":function(container,depth0,helpers,partials,data) {
    var helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "  <p>It has also been added to your <a href=\""
    + container.escapeExpression(((helper = (helper = lookupProperty(helpers,"keychainUrl") || (depth0 != null ? lookupProperty(depth0,"keychainUrl") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"keychainUrl","hash":{},"data":data,"loc":{"start":{"line":7,"column":45},"end":{"line":7,"column":60}}}) : helper)))
    + "\">Unlock Keychain</a>, where you can view it and, if needed, print it as a signed QR Code!</p>\n";
},"3":function(container,depth0,helpers,partials,data) {
    var helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "  <p>You can transfer it to your own wallet <a href=\""
    + container.escapeExpression(((helper = (helper = lookupProperty(helpers,"transferUrl") || (depth0 != null ? lookupProperty(depth0,"transferUrl") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"transferUrl","hash":{},"data":data,"loc":{"start":{"line":9,"column":53},"end":{"line":9,"column":68}}}) : helper)))
    + "\">by going there</a>.</p>\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<h1>Your NFT certification for \""
    + alias3(((helper = (helper = lookupProperty(helpers,"lockName") || (depth0 != null ? lookupProperty(depth0,"lockName") : depth0)) != null ? helper : alias2),(typeof helper === "function" ? helper.call(alias1,{"name":"lockName","hash":{},"data":data,"loc":{"start":{"line":1,"column":32},"end":{"line":1,"column":44}}}) : helper)))
    + "\" was airdropped!</h1>\n"
    + alias3((lookupProperty(helpers,"certificationLink")||(depth0 && lookupProperty(depth0,"certificationLink"))||alias2).call(alias1,(depth0 != null ? lookupProperty(depth0,"lockName") : depth0),(depth0 != null ? lookupProperty(depth0,"certificationUrl") : depth0),{"name":"certificationLink","hash":{},"data":data,"loc":{"start":{"line":2,"column":0},"end":{"line":2,"column":47}}}))
    + "\n\n"
    + alias3((lookupProperty(helpers,"formattedCustomContent")||(depth0 && lookupProperty(depth0,"formattedCustomContent"))||alias2).call(alias1,"Certification Authority",(depth0 != null ? lookupProperty(depth0,"customContent") : depth0),{"name":"formattedCustomContent","hash":{},"data":data,"loc":{"start":{"line":4,"column":0},"end":{"line":4,"column":66}}}))
    + "\n\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"isUserAddress") : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.program(3, data, 0),"data":data,"loc":{"start":{"line":6,"column":0},"end":{"line":10,"column":7}}})) != null ? stack1 : "");
},"useData":true},
};

export const certificationKeyMined: TemplateCollection = {
  subject: {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "Your certification for "
    + ((stack1 = ((helper = (helper = lookupProperty(helpers,"lockName") || (depth0 != null ? lookupProperty(depth0,"lockName") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"lockName","hash":{},"data":data,"loc":{"start":{"line":1,"column":23},"end":{"line":1,"column":37}}}) : helper))) != null ? stack1 : "");
},"useData":true},
  html: {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", alias4=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<h1>A NFT certification for \""
    + alias4(((helper = (helper = lookupProperty(helpers,"lockName") || (depth0 != null ? lookupProperty(depth0,"lockName") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"lockName","hash":{},"data":data,"loc":{"start":{"line":1,"column":29},"end":{"line":1,"column":41}}}) : helper)))
    + "\" was sent to you!</h1>\n"
    + alias4((lookupProperty(helpers,"certificationLink")||(depth0 && lookupProperty(depth0,"certificationLink"))||alias2).call(alias1,(depth0 != null ? lookupProperty(depth0,"lockName") : depth0),(depth0 != null ? lookupProperty(depth0,"certificationUrl") : depth0),{"name":"certificationLink","hash":{},"data":data,"loc":{"start":{"line":2,"column":0},"end":{"line":2,"column":47}}}))
    + "\n\n"
    + alias4((lookupProperty(helpers,"formattedCustomContent")||(depth0 && lookupProperty(depth0,"formattedCustomContent"))||alias2).call(alias1,"Certification Authority",(depth0 != null ? lookupProperty(depth0,"customContent") : depth0),{"name":"formattedCustomContent","hash":{},"data":data,"loc":{"start":{"line":4,"column":0},"end":{"line":4,"column":66}}}))
    + "\n\n<p>It has been added to your <a href=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"keychainUrl") || (depth0 != null ? lookupProperty(depth0,"keychainUrl") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"keychainUrl","hash":{},"data":data,"loc":{"start":{"line":6,"column":38},"end":{"line":6,"column":53}}}) : helper)))
    + "\">Unlock Keychain</a>, where you can view it and its metadata.</p>\n\n";
},"useData":true},
};

export const confirmEmail: TemplateCollection = {
  subject: {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "Please confirm your email address";
},"useData":true},
  html: {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", alias4=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<h1>Welcome to Unlock!</h1>\n\n    <p>To get started, please confirm your email address by clicking on <a href=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"confirmLink") || (depth0 != null ? lookupProperty(depth0,"confirmLink") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"confirmLink","hash":{},"data":data,"loc":{"start":{"line":3,"column":81},"end":{"line":3,"column":96}}}) : helper)))
    + "?email="
    + alias4(((helper = (helper = lookupProperty(helpers,"email") || (depth0 != null ? lookupProperty(depth0,"email") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"email","hash":{},"data":data,"loc":{"start":{"line":3,"column":103},"end":{"line":3,"column":112}}}) : helper)))
    + "&signedEmail="
    + alias4(((helper = (helper = lookupProperty(helpers,"signedEmail") || (depth0 != null ? lookupProperty(depth0,"signedEmail") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"signedEmail","hash":{},"data":data,"loc":{"start":{"line":3,"column":125},"end":{"line":3,"column":140}}}) : helper)))
    + "\">this link</a>.</p>\n\n    <p>\n      You can also copy and paste the following URL on your web browser: <code>"
    + alias4(((helper = (helper = lookupProperty(helpers,"confirmLink") || (depth0 != null ? lookupProperty(depth0,"confirmLink") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"confirmLink","hash":{},"data":data,"loc":{"start":{"line":6,"column":79},"end":{"line":6,"column":94}}}) : helper)))
    + "?email="
    + alias4(((helper = (helper = lookupProperty(helpers,"email") || (depth0 != null ? lookupProperty(depth0,"email") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"email","hash":{},"data":data,"loc":{"start":{"line":6,"column":101},"end":{"line":6,"column":110}}}) : helper)))
    + "&signedEmail="
    + alias4(((helper = (helper = lookupProperty(helpers,"signedEmail") || (depth0 != null ? lookupProperty(depth0,"signedEmail") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"signedEmail","hash":{},"data":data,"loc":{"start":{"line":6,"column":123},"end":{"line":6,"column":138}}}) : helper)))
    + "</code>    \n    </p>\n\n    <p>Once your email address is confirmed, you'll be able to use your Unlock account to pay for content and services.</p>\n";
},"useData":true},
};

export const custom: TemplateCollection = {
  subject: {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return container.escapeExpression(((helper = (helper = lookupProperty(helpers,"subject") || (depth0 != null ? lookupProperty(depth0,"subject") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"subject","hash":{},"data":data,"loc":{"start":{"line":1,"column":0},"end":{"line":1,"column":11}}}) : helper)));
},"useData":true},
  html: {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "\n  "
    + alias3((lookupProperty(helpers,"formattedCustomContent")||(depth0 && lookupProperty(depth0,"formattedCustomContent"))||alias2).call(alias1,"Contract Manager",(depth0 != null ? lookupProperty(depth0,"content") : depth0),{"name":"formattedCustomContent","hash":{},"data":data,"loc":{"start":{"line":2,"column":2},"end":{"line":2,"column":55}}}))
    + "\n  <p>If you do not want to receive emails for this person, you can <a href=\""
    + alias3(((helper = (helper = lookupProperty(helpers,"unsubscribeLink") || (depth0 != null ? lookupProperty(depth0,"unsubscribeLink") : depth0)) != null ? helper : alias2),(typeof helper === "function" ? helper.call(alias1,{"name":"unsubscribeLink","hash":{},"data":data,"loc":{"start":{"line":3,"column":76},"end":{"line":3,"column":95}}}) : helper)))
    + "\">unsubscribe</a>.</p>\n  ";
},"useData":true},
};

export const debug: TemplateCollection = {
  subject: {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "Debug Email";
},"useData":true},
  html: {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<h1>\n      Welcome to Unlock!\n    </h1>\n    <p>This is a test email. Please ignore and/or report if you're getting it!\n    "
    + container.escapeExpression(((helper = (helper = lookupProperty(helpers,"foo") || (depth0 != null ? lookupProperty(depth0,"foo") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"foo","hash":{},"data":data,"loc":{"start":{"line":5,"column":4},"end":{"line":5,"column":11}}}) : helper)))
    + "</p>\n    ";
},"useData":true},
};

export const eventApprovedInCollection: TemplateCollection = {
  subject: {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", alias4=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "The event \""
    + alias4(((helper = (helper = lookupProperty(helpers,"eventName") || (depth0 != null ? lookupProperty(depth0,"eventName") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"eventName","hash":{},"data":data,"loc":{"start":{"line":1,"column":11},"end":{"line":1,"column":24}}}) : helper)))
    + "\" has been approved for \""
    + alias4(((helper = (helper = lookupProperty(helpers,"collectionName") || (depth0 != null ? lookupProperty(depth0,"collectionName") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"collectionName","hash":{},"data":data,"loc":{"start":{"line":1,"column":49},"end":{"line":1,"column":67}}}) : helper)))
    + "\"";
},"useData":true},
  html: {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", alias4=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<h1>Event Approved</h1>\n\n  <p>\n    Congratulations! The event \"<strong>"
    + alias4(((helper = (helper = lookupProperty(helpers,"eventName") || (depth0 != null ? lookupProperty(depth0,"eventName") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"eventName","hash":{},"data":data,"loc":{"start":{"line":4,"column":40},"end":{"line":4,"column":53}}}) : helper)))
    + "</strong>\" has been approved and added to the \"<strong>"
    + alias4(((helper = (helper = lookupProperty(helpers,"collectionName") || (depth0 != null ? lookupProperty(depth0,"collectionName") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"collectionName","hash":{},"data":data,"loc":{"start":{"line":4,"column":108},"end":{"line":4,"column":126}}}) : helper)))
    + "</strong>\" collection.\n  </p>\n\n  "
    + alias4((lookupProperty(helpers,"eventDetailsLight")||(depth0 && lookupProperty(depth0,"eventDetailsLight"))||alias2).call(alias1,(depth0 != null ? lookupProperty(depth0,"eventName") : depth0),(depth0 != null ? lookupProperty(depth0,"eventDate") : depth0),(depth0 != null ? lookupProperty(depth0,"eventUrl") : depth0),{"name":"eventDetailsLight","hash":{},"data":data,"loc":{"start":{"line":7,"column":2},"end":{"line":11,"column":4}}}))
    + "\n\n  <p>\n    You can view this event in the collection and share the collection link to promote the event.\n  </p>\n\n  <p>\n    <a href=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"collectionUrl") || (depth0 != null ? lookupProperty(depth0,"collectionUrl") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"collectionUrl","hash":{},"data":data,"loc":{"start":{"line":18,"column":13},"end":{"line":18,"column":30}}}) : helper)))
    + "\">View the collection</a>\n  </p>\n\n  <p>\n    If you have any questions or need further assistance, reply to this email.\n  </p>\n  ";
},"useData":true},
};

export const eventCollectionCreated: TemplateCollection = {
  subject: {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "Your event collection \""
    + container.escapeExpression(((helper = (helper = lookupProperty(helpers,"collectionName") || (depth0 != null ? lookupProperty(depth0,"collectionName") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"collectionName","hash":{},"data":data,"loc":{"start":{"line":1,"column":23},"end":{"line":1,"column":41}}}) : helper)))
    + "\" is live!";
},"useData":true},
  html: {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", alias4=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<h1>Your Event Collection is Live!</h1>\n\n  <p>\n    <strong>Congratulations!</strong> Your event collection \""
    + alias4(((helper = (helper = lookupProperty(helpers,"collectionName") || (depth0 != null ? lookupProperty(depth0,"collectionName") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"collectionName","hash":{},"data":data,"loc":{"start":{"line":4,"column":61},"end":{"line":4,"column":79}}}) : helper)))
    + "\" has been successfully created. Start by sharing it with your community and add events.\n  </p>\n\n  "
    + alias4((lookupProperty(helpers,"collectionDetailsLight")||(depth0 && lookupProperty(depth0,"collectionDetailsLight"))||alias2).call(alias1,(depth0 != null ? lookupProperty(depth0,"collectionName") : depth0),(depth0 != null ? lookupProperty(depth0,"collectionUrl") : depth0),{"name":"collectionDetailsLight","hash":{},"data":data,"loc":{"start":{"line":7,"column":2},"end":{"line":10,"column":4}}}))
    + "\n\n  <p>\n    Next Steps:\n  </p>\n\n  <ul>\n    <li><strong>Share your collection</strong><br>\n    Use this link to share your collection: <a href=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"collectionUrl") || (depth0 != null ? lookupProperty(depth0,"collectionUrl") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"collectionUrl","hash":{},"data":data,"loc":{"start":{"line":18,"column":53},"end":{"line":18,"column":70}}}) : helper)))
    + "\">"
    + alias4(((helper = (helper = lookupProperty(helpers,"collectionUrl") || (depth0 != null ? lookupProperty(depth0,"collectionUrl") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"collectionUrl","hash":{},"data":data,"loc":{"start":{"line":18,"column":72},"end":{"line":18,"column":89}}}) : helper)))
    + "</a></li>\n\n    <li><strong>Customize Settings</strong><br>\n    Update the description, images, and social links in your collection settings.</li>\n\n    <li><strong>Add Events</strong><br>\n    Add new events by creating them, using existing event URLs, or selecting from your existing events.</li>\n\n    <li><strong>Manage Contributors</strong><br>\n    Assign additional managers to help curate and approve events.</li>\n  </ul>\n\n  <p>\n    Need assistance? Reply to this email, and we’ll be happy to help.\n  </p>\n  ";
},"useData":true},
};

export const eventDeniedInCollection: TemplateCollection = {
  subject: {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", alias4=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "The event \""
    + alias4(((helper = (helper = lookupProperty(helpers,"eventName") || (depth0 != null ? lookupProperty(depth0,"eventName") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"eventName","hash":{},"data":data,"loc":{"start":{"line":1,"column":11},"end":{"line":1,"column":24}}}) : helper)))
    + "\" was not approved for \""
    + alias4(((helper = (helper = lookupProperty(helpers,"collectionName") || (depth0 != null ? lookupProperty(depth0,"collectionName") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"collectionName","hash":{},"data":data,"loc":{"start":{"line":1,"column":48},"end":{"line":1,"column":66}}}) : helper)))
    + "\"";
},"useData":true},
  html: {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", alias4=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<h1>Event Submission Update</h1>\n\n  <p>\n    Unfortunately, the event \"<strong>"
    + alias4(((helper = (helper = lookupProperty(helpers,"eventName") || (depth0 != null ? lookupProperty(depth0,"eventName") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"eventName","hash":{},"data":data,"loc":{"start":{"line":4,"column":38},"end":{"line":4,"column":51}}}) : helper)))
    + "</strong>\" was not approved for the \"<strong>"
    + alias4(((helper = (helper = lookupProperty(helpers,"collectionName") || (depth0 != null ? lookupProperty(depth0,"collectionName") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"collectionName","hash":{},"data":data,"loc":{"start":{"line":4,"column":96},"end":{"line":4,"column":114}}}) : helper)))
    + "</strong>\" collection.\n  </p>\n\n  "
    + alias4((lookupProperty(helpers,"eventDetailsLight")||(depth0 && lookupProperty(depth0,"eventDetailsLight"))||alias2).call(alias1,(depth0 != null ? lookupProperty(depth0,"eventName") : depth0),(depth0 != null ? lookupProperty(depth0,"eventDate") : depth0),(depth0 != null ? lookupProperty(depth0,"eventUrl") : depth0),{"name":"eventDetailsLight","hash":{},"data":data,"loc":{"start":{"line":7,"column":2},"end":{"line":11,"column":4}}}))
    + "\n\n  <p>\n    Thank you for your interest in contributing to this collection.\n  </p>\n  ";
},"useData":true},
};

export const eventDeployed: TemplateCollection = {
  subject: {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "Your event "
    + container.escapeExpression(((helper = (helper = lookupProperty(helpers,"eventName") || (depth0 != null ? lookupProperty(depth0,"eventName") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"eventName","hash":{},"data":data,"loc":{"start":{"line":1,"column":11},"end":{"line":1,"column":24}}}) : helper)))
    + " is live onchain!";
},"useData":true},
  html: {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<h1>Your event is live onchain!</h1>\n\n<p>\n  <strong>Congratulations</strong>! Now, it's time to share your beautiful new event page and invite attendees to RSVP!\n</p>\n\n"
    + alias3((lookupProperty(helpers,"eventDetailsLight")||(depth0 && lookupProperty(depth0,"eventDetailsLight"))||alias2).call(alias1,(depth0 != null ? lookupProperty(depth0,"eventName") : depth0),(depth0 != null ? lookupProperty(depth0,"eventDate") : depth0),(depth0 != null ? lookupProperty(depth0,"eventTime") : depth0),(depth0 != null ? lookupProperty(depth0,"eventUrl") : depth0),{"name":"eventDetailsLight","hash":{},"data":data,"loc":{"start":{"line":7,"column":0},"end":{"line":12,"column":2}}}))
    + "\n\n<p>\nWhat's next?\n</p>\n\n<ul>\n<li><strong>💬 Share a Link</strong><br>\nThe public link to your event is "
    + alias3(((helper = (helper = lookupProperty(helpers,"eventUrl") || (depth0 != null ? lookupProperty(depth0,"eventUrl") : depth0)) != null ? helper : alias2),(typeof helper === "function" ? helper.call(alias1,{"name":"eventUrl","hash":{},"data":data,"loc":{"start":{"line":20,"column":33},"end":{"line":20,"column":45}}}) : helper)))
    + ".</li>\n\n<li><strong>🎨 Update settings!</strong><br>\nUpdate the description, time, location, set images... </li>\n\n<li><strong>💁 Attendees</strong><br>\nApprove and view attendees in the dashboard.</li>\n\n<li><strong>📱 Learn how to check people in</strong><br>\nEach attendee will receive a QR code to check in at the event. \n</li>\n</ul>\n\n<p>\nHave questions? Reply to this email 😎.\n</p>\n\n";
},"useData":true},
};

export const eventKeyAirdropped: TemplateCollection = {
  subject: {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "Here is your ticket!";
},"useData":true},
  html: {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<h1>Here is your ticket</h1>\n\n"
    + alias3((lookupProperty(helpers,"formattedCustomContent")||(depth0 && lookupProperty(depth0,"formattedCustomContent"))||alias2).call(alias1,"Event Organizer",(depth0 != null ? lookupProperty(depth0,"customContent") : depth0),{"name":"formattedCustomContent","hash":{},"data":data,"loc":{"start":{"line":3,"column":0},"end":{"line":3,"column":58}}}))
    + "\n  \n"
    + alias3((lookupProperty(helpers,"eventDetails")||(depth0 && lookupProperty(depth0,"eventDetails"))||alias2).call(alias1,(depth0 != null ? lookupProperty(depth0,"eventName") : depth0),(depth0 != null ? lookupProperty(depth0,"keyId") : depth0),(depth0 != null ? lookupProperty(depth0,"eventDate") : depth0),(depth0 != null ? lookupProperty(depth0,"eventTime") : depth0),(depth0 != null ? lookupProperty(depth0,"eventAddress") : depth0),(depth0 != null ? lookupProperty(depth0,"eventUrl") : depth0),{"name":"eventDetails","hash":{},"data":data,"loc":{"start":{"line":5,"column":0},"end":{"line":12,"column":2}}}))
    + "\n\n<small>Have a crypto wallet? Your ticket is an NFT and can be transferred to your self-custodial wallet <a href=\""
    + alias3(((helper = (helper = lookupProperty(helpers,"transferUrl") || (depth0 != null ? lookupProperty(depth0,"transferUrl") : depth0)) != null ? helper : alias2),(typeof helper === "function" ? helper.call(alias1,{"name":"transferUrl","hash":{},"data":data,"loc":{"start":{"line":14,"column":113},"end":{"line":14,"column":128}}}) : helper)))
    + "\">by going there</a>.</small>\n";
},"useData":true},
};

export const eventKeyMined: TemplateCollection = {
  subject: {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "Here is your ticket for "
    + ((stack1 = ((helper = (helper = lookupProperty(helpers,"lockName") || (depth0 != null ? lookupProperty(depth0,"lockName") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"lockName","hash":{},"data":data,"loc":{"start":{"line":1,"column":24},"end":{"line":1,"column":38}}}) : helper))) != null ? stack1 : "");
},"useData":true},
  html: {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<h1>Here's your ticket</h1>\n\n"
    + alias3((lookupProperty(helpers,"formattedCustomContent")||(depth0 && lookupProperty(depth0,"formattedCustomContent"))||alias2).call(alias1,"Event Organizer",(depth0 != null ? lookupProperty(depth0,"customContent") : depth0),{"name":"formattedCustomContent","hash":{},"data":data,"loc":{"start":{"line":3,"column":0},"end":{"line":3,"column":58}}}))
    + "\n\n"
    + alias3((lookupProperty(helpers,"eventDetails")||(depth0 && lookupProperty(depth0,"eventDetails"))||alias2).call(alias1,(depth0 != null ? lookupProperty(depth0,"eventName") : depth0),(depth0 != null ? lookupProperty(depth0,"keyId") : depth0),(depth0 != null ? lookupProperty(depth0,"eventDate") : depth0),(depth0 != null ? lookupProperty(depth0,"eventTime") : depth0),(depth0 != null ? lookupProperty(depth0,"eventAddress") : depth0),(depth0 != null ? lookupProperty(depth0,"eventUrl") : depth0),{"name":"eventDetails","hash":{},"data":data,"loc":{"start":{"line":5,"column":0},"end":{"line":12,"column":2}}}))
    + "\n\n"
    + alias3((lookupProperty(helpers,"transactionLink")||(depth0 && lookupProperty(depth0,"transactionLink"))||alias2).call(alias1,(depth0 != null ? lookupProperty(depth0,"transactionReceiptUrl") : depth0),{"name":"transactionLink","hash":{},"data":data,"loc":{"start":{"line":14,"column":0},"end":{"line":14,"column":41}}}))
    + "\n";
},"useData":true},
};

export const eventRsvpSubmitted: TemplateCollection = {
  subject: {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "You have applied to attend "
    + ((stack1 = ((helper = (helper = lookupProperty(helpers,"eventName") || (depth0 != null ? lookupProperty(depth0,"eventName") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"eventName","hash":{},"data":data,"loc":{"start":{"line":1,"column":27},"end":{"line":1,"column":42}}}) : helper))) != null ? stack1 : "")
    + "!";
},"useData":true},
  html: {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<h1>Thanks</h1>\n\nYou have successfully applied to attend <strong>"
    + ((stack1 = ((helper = (helper = lookupProperty(helpers,"eventName") || (depth0 != null ? lookupProperty(depth0,"eventName") : depth0)) != null ? helper : alias2),(typeof helper === "function" ? helper.call(alias1,{"name":"eventName","hash":{},"data":data,"loc":{"start":{"line":3,"column":48},"end":{"line":3,"column":63}}}) : helper))) != null ? stack1 : "")
    + "</strong>.\nThe organizer will be in touch with you soon, and, if you are accepted, \nyou will receive a confirmation email with your ticket!\n\n"
    + container.escapeExpression((lookupProperty(helpers,"eventDetailsLight")||(depth0 && lookupProperty(depth0,"eventDetailsLight"))||alias2).call(alias1,(depth0 != null ? lookupProperty(depth0,"eventName") : depth0),(depth0 != null ? lookupProperty(depth0,"eventDate") : depth0),(depth0 != null ? lookupProperty(depth0,"eventTime") : depth0),(depth0 != null ? lookupProperty(depth0,"eventUrl") : depth0),{"name":"eventDetailsLight","hash":{},"data":data,"loc":{"start":{"line":7,"column":0},"end":{"line":12,"column":2}}}))
    + "\n";
},"useData":true},
};

export const eventSubmittedToCollectionManager: TemplateCollection = {
  subject: {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", alias4=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "New event \""
    + alias4(((helper = (helper = lookupProperty(helpers,"eventName") || (depth0 != null ? lookupProperty(depth0,"eventName") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"eventName","hash":{},"data":data,"loc":{"start":{"line":1,"column":11},"end":{"line":1,"column":24}}}) : helper)))
    + "\" submitted to \""
    + alias4(((helper = (helper = lookupProperty(helpers,"collectionName") || (depth0 != null ? lookupProperty(depth0,"collectionName") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"collectionName","hash":{},"data":data,"loc":{"start":{"line":1,"column":40},"end":{"line":1,"column":58}}}) : helper)))
    + "\"";
},"useData":true},
  html: {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", alias4=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<h1>New Event Submitted</h1>\n\n  <p>\n    A new event titled \"<strong>"
    + alias4(((helper = (helper = lookupProperty(helpers,"eventName") || (depth0 != null ? lookupProperty(depth0,"eventName") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"eventName","hash":{},"data":data,"loc":{"start":{"line":4,"column":32},"end":{"line":4,"column":45}}}) : helper)))
    + "</strong>\" has been submitted to the \"<strong>"
    + alias4(((helper = (helper = lookupProperty(helpers,"collectionName") || (depth0 != null ? lookupProperty(depth0,"collectionName") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"collectionName","hash":{},"data":data,"loc":{"start":{"line":4,"column":91},"end":{"line":4,"column":109}}}) : helper)))
    + "</strong>\" collection.\n  </p>\n\n  "
    + alias4((lookupProperty(helpers,"eventDetailsLight")||(depth0 && lookupProperty(depth0,"eventDetailsLight"))||alias2).call(alias1,(depth0 != null ? lookupProperty(depth0,"eventName") : depth0),(depth0 != null ? lookupProperty(depth0,"eventDate") : depth0),(depth0 != null ? lookupProperty(depth0,"eventUrl") : depth0),{"name":"eventDetailsLight","hash":{},"data":data,"loc":{"start":{"line":7,"column":2},"end":{"line":11,"column":4}}}))
    + "\n\n  <p>\n    Please review and approve or reject the event.\n  </p>\n\n  <p>\n    <a href=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"collectionUrl") || (depth0 != null ? lookupProperty(depth0,"collectionUrl") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"collectionUrl","hash":{},"data":data,"loc":{"start":{"line":18,"column":13},"end":{"line":18,"column":30}}}) : helper)))
    + "\">Go to the collection dashboard</a>\n  </p>\n\n  <p>\n    Need assistance? Reply to this email, and we’ll be happy to help.\n  </p>\n  ";
},"useData":true},
};

export const eventSubmittedToCollectionSubmitter: TemplateCollection = {
  subject: {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", alias4=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "The event \""
    + alias4(((helper = (helper = lookupProperty(helpers,"eventName") || (depth0 != null ? lookupProperty(depth0,"eventName") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"eventName","hash":{},"data":data,"loc":{"start":{"line":1,"column":11},"end":{"line":1,"column":24}}}) : helper)))
    + "\" has been submitted to \""
    + alias4(((helper = (helper = lookupProperty(helpers,"collectionName") || (depth0 != null ? lookupProperty(depth0,"collectionName") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"collectionName","hash":{},"data":data,"loc":{"start":{"line":1,"column":49},"end":{"line":1,"column":67}}}) : helper)))
    + "\"";
},"useData":true},
  html: {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", alias4=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<h1>Event Submission Received</h1>\n\n  <p>\n    Thank you for submitting your event \"<strong>"
    + alias4(((helper = (helper = lookupProperty(helpers,"eventName") || (depth0 != null ? lookupProperty(depth0,"eventName") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"eventName","hash":{},"data":data,"loc":{"start":{"line":4,"column":49},"end":{"line":4,"column":62}}}) : helper)))
    + "</strong>\" to the collection \"<strong>"
    + alias4(((helper = (helper = lookupProperty(helpers,"collectionName") || (depth0 != null ? lookupProperty(depth0,"collectionName") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"collectionName","hash":{},"data":data,"loc":{"start":{"line":4,"column":100},"end":{"line":4,"column":118}}}) : helper)))
    + "</strong>\".\n  </p>\n\n  "
    + alias4((lookupProperty(helpers,"eventDetailsLight")||(depth0 && lookupProperty(depth0,"eventDetailsLight"))||alias2).call(alias1,(depth0 != null ? lookupProperty(depth0,"eventName") : depth0),(depth0 != null ? lookupProperty(depth0,"eventDate") : depth0),(depth0 != null ? lookupProperty(depth0,"eventUrl") : depth0),{"name":"eventDetailsLight","hash":{},"data":data,"loc":{"start":{"line":7,"column":2},"end":{"line":11,"column":4}}}))
    + "\n\n  <p>\n    Your event is now pending approval. You will receive a notification once it has been reviewed.\n  </p>\n\n\n  <p>\n    If you have any questions, feel free to reply to this email.\n  </p>\n  ";
},"useData":true},
};

export const inviteEvent: TemplateCollection = {
  subject: {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "You are invited to RSVP for "
    + container.escapeExpression(((helper = (helper = lookupProperty(helpers,"eventName") || (depth0 != null ? lookupProperty(depth0,"eventName") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"eventName","hash":{},"data":data,"loc":{"start":{"line":1,"column":28},"end":{"line":1,"column":41}}}) : helper)));
},"useData":true},
  html: {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", alias4=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<h1>You are invited to "
    + alias4(((helper = (helper = lookupProperty(helpers,"eventName") || (depth0 != null ? lookupProperty(depth0,"eventName") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"eventName","hash":{},"data":data,"loc":{"start":{"line":1,"column":23},"end":{"line":1,"column":36}}}) : helper)))
    + "!</h1>\n\n<p>The organizer of "
    + alias4(((helper = (helper = lookupProperty(helpers,"eventName") || (depth0 != null ? lookupProperty(depth0,"eventName") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"eventName","hash":{},"data":data,"loc":{"start":{"line":3,"column":20},"end":{"line":3,"column":33}}}) : helper)))
    + " is inviting you to RSVP for their event.</p>\n\n"
    + alias4((lookupProperty(helpers,"eventDetailsLight")||(depth0 && lookupProperty(depth0,"eventDetailsLight"))||alias2).call(alias1,(depth0 != null ? lookupProperty(depth0,"eventName") : depth0),(depth0 != null ? lookupProperty(depth0,"eventDate") : depth0),(depth0 != null ? lookupProperty(depth0,"eventTime") : depth0),(depth0 != null ? lookupProperty(depth0,"eventUrl") : depth0),{"name":"eventDetailsLight","hash":{},"data":data,"loc":{"start":{"line":5,"column":0},"end":{"line":10,"column":2}}}))
    + "\n\n\n";
},"useData":true},
};

export const keyAirdropped: TemplateCollection = {
  subject: {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "You have received a new NFT!";
},"useData":true},
  html: {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", alias4=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<h1>You have received a new NFT!</h1>\n\n<p>A new membership (#"
    + alias4(((helper = (helper = lookupProperty(helpers,"keyId") || (depth0 != null ? lookupProperty(depth0,"keyId") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"keyId","hash":{},"data":data,"loc":{"start":{"line":3,"column":22},"end":{"line":3,"column":31}}}) : helper)))
    + ") to the lock <strong>"
    + alias4(((helper = (helper = lookupProperty(helpers,"lockName") || (depth0 != null ? lookupProperty(depth0,"lockName") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"lockName","hash":{},"data":data,"loc":{"start":{"line":3,"column":53},"end":{"line":3,"column":65}}}) : helper)))
    + "</strong> was just airdropped for you!</p>\n\n"
    + alias4((lookupProperty(helpers,"formattedCustomContent")||(depth0 && lookupProperty(depth0,"formattedCustomContent"))||alias2).call(alias1,"Membership Manager",(depth0 != null ? lookupProperty(depth0,"customContent") : depth0),{"name":"formattedCustomContent","hash":{},"data":data,"loc":{"start":{"line":5,"column":0},"end":{"line":5,"column":61}}}))
    + "\n\n<p> You can transfer it to your own wallet <a href=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"transferUrl") || (depth0 != null ? lookupProperty(depth0,"transferUrl") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"transferUrl","hash":{},"data":data,"loc":{"start":{"line":7,"column":52},"end":{"line":7,"column":67}}}) : helper)))
    + "\">by going there</a>. You can also print Membership NFT as a signed QR code attached to this email. </p>\n\n"
    + alias4((lookupProperty(helpers,"links")||(depth0 && lookupProperty(depth0,"links"))||alias2).call(alias1,(depth0 != null ? lookupProperty(depth0,"txUrl") : depth0),(depth0 != null ? lookupProperty(depth0,"openSeaUrl") : depth0),true,{"name":"links","hash":{},"data":data,"loc":{"start":{"line":9,"column":0},"end":{"line":9,"column":31}}}))
    + "\n\n";
},"useData":true},
};

export const keyExpired: TemplateCollection = {
  subject: {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "Your \""
    + container.escapeExpression(((helper = (helper = lookupProperty(helpers,"lockName") || (depth0 != null ? lookupProperty(depth0,"lockName") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"lockName","hash":{},"data":data,"loc":{"start":{"line":1,"column":6},"end":{"line":1,"column":18}}}) : helper)))
    + "\" membership has expired!";
},"useData":true},
  html: {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", alias4=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<h1>Your Membership NFT is expired!</h1>\n\n<p>Your <strong>"
    + alias4(((helper = (helper = lookupProperty(helpers,"lockName") || (depth0 != null ? lookupProperty(depth0,"lockName") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"lockName","hash":{},"data":data,"loc":{"start":{"line":3,"column":16},"end":{"line":3,"column":28}}}) : helper)))
    + "</strong> membership (#"
    + alias4(((helper = (helper = lookupProperty(helpers,"keyId") || (depth0 != null ? lookupProperty(depth0,"keyId") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"keyId","hash":{},"data":data,"loc":{"start":{"line":3,"column":51},"end":{"line":3,"column":60}}}) : helper)))
    + ") has now expired.</p>\n\n"
    + alias4((lookupProperty(helpers,"formattedCustomContent")||(depth0 && lookupProperty(depth0,"formattedCustomContent"))||alias2).call(alias1,"Membership Manager",(depth0 != null ? lookupProperty(depth0,"customContent") : depth0),{"name":"formattedCustomContent","hash":{},"data":data,"loc":{"start":{"line":5,"column":0},"end":{"line":5,"column":61}}}))
    + "\n\n<p>You can extend it directly from the <a href=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"keychainUrl") || (depth0 != null ? lookupProperty(depth0,"keychainUrl") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"keychainUrl","hash":{},"data":data,"loc":{"start":{"line":7,"column":48},"end":{"line":7,"column":63}}}) : helper)))
    + "\">Unlock Keychain</a>, so you don't lose any benefit.</p>\n";
},"useData":true},
};

export const keyExpiring: TemplateCollection = {
  subject: {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "Your \""
    + container.escapeExpression(((helper = (helper = lookupProperty(helpers,"lockName") || (depth0 != null ? lookupProperty(depth0,"lockName") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"lockName","hash":{},"data":data,"loc":{"start":{"line":1,"column":6},"end":{"line":1,"column":18}}}) : helper)))
    + "\" membership is about to expire!";
},"useData":true},
  html: {"1":function(container,depth0,helpers,partials,data) {
    var helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "  <p>You can renew this membership from the <a href=\""
    + container.escapeExpression(((helper = (helper = lookupProperty(helpers,"keychainUrl") || (depth0 != null ? lookupProperty(depth0,"keychainUrl") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"keychainUrl","hash":{},"data":data,"loc":{"start":{"line":8,"column":53},"end":{"line":8,"column":68}}}) : helper)))
    + "\">Unlock Keychain</a> so you don't lose any benefit.</p>\n";
},"3":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", alias4=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "  <p>This membership will automatically renew, since your balance of "
    + alias4(((helper = (helper = lookupProperty(helpers,"currency") || (depth0 != null ? lookupProperty(depth0,"currency") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"currency","hash":{},"data":data,"loc":{"start":{"line":12,"column":69},"end":{"line":12,"column":81}}}) : helper)))
    + " is enough. You can cancel this renewal from the <a href=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"keychainUrl") || (depth0 != null ? lookupProperty(depth0,"keychainUrl") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"keychainUrl","hash":{},"data":data,"loc":{"start":{"line":12,"column":139},"end":{"line":12,"column":154}}}) : helper)))
    + "\">Unlock Keychain</a>.</p>\n";
},"5":function(container,depth0,helpers,partials,data) {
    var helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "  <p>This membership will not automatically renew because the membership contract terms have changed. You can approve the new terms from the <a href=\""
    + container.escapeExpression(((helper = (helper = lookupProperty(helpers,"keychainUrl") || (depth0 != null ? lookupProperty(depth0,"keychainUrl") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"keychainUrl","hash":{},"data":data,"loc":{"start":{"line":16,"column":150},"end":{"line":16,"column":165}}}) : helper)))
    + "\">Unlock Keychain</a> so you don't lose any benefit.</p>\n";
},"7":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", alias4=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "  <p>This membership will not automatically renew because you have not approved enough "
    + alias4(((helper = (helper = lookupProperty(helpers,"currency") || (depth0 != null ? lookupProperty(depth0,"currency") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"currency","hash":{},"data":data,"loc":{"start":{"line":20,"column":87},"end":{"line":20,"column":99}}}) : helper)))
    + ". You can approve renewals from the <a href=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"keychainUrl") || (depth0 != null ? lookupProperty(depth0,"keychainUrl") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"keychainUrl","hash":{},"data":data,"loc":{"start":{"line":20,"column":144},"end":{"line":20,"column":159}}}) : helper)))
    + "\">Unlock Keychain</a> so you don't lose any benefit.</p>\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", alias4=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<h1>Your Membership NFT will expire soon</h1>\n\n<p>Your <strong>"
    + alias4(((helper = (helper = lookupProperty(helpers,"lockName") || (depth0 != null ? lookupProperty(depth0,"lockName") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"lockName","hash":{},"data":data,"loc":{"start":{"line":3,"column":16},"end":{"line":3,"column":28}}}) : helper)))
    + "</strong> membership (#"
    + alias4(((helper = (helper = lookupProperty(helpers,"keyId") || (depth0 != null ? lookupProperty(depth0,"keyId") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"keyId","hash":{},"data":data,"loc":{"start":{"line":3,"column":51},"end":{"line":3,"column":60}}}) : helper)))
    + ") will expire on "
    + alias4(((helper = (helper = lookupProperty(helpers,"expirationDate") || (depth0 != null ? lookupProperty(depth0,"expirationDate") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"expirationDate","hash":{},"data":data,"loc":{"start":{"line":3,"column":77},"end":{"line":3,"column":95}}}) : helper)))
    + "</p>\n\n"
    + alias4((lookupProperty(helpers,"formattedCustomContent")||(depth0 && lookupProperty(depth0,"formattedCustomContent"))||alias2).call(alias1,"Membership Manager",(depth0 != null ? lookupProperty(depth0,"customContent") : depth0),{"name":"formattedCustomContent","hash":{},"data":data,"loc":{"start":{"line":5,"column":0},"end":{"line":5,"column":61}}}))
    + "\n\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"isRenewable") : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":7,"column":0},"end":{"line":9,"column":7}}})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"isAutoRenewable") : depth0),{"name":"if","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":11,"column":0},"end":{"line":13,"column":7}}})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"isRenewableIfRePurchased") : depth0),{"name":"if","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":15,"column":0},"end":{"line":17,"column":7}}})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"isRenewableIfReApproved") : depth0),{"name":"if","hash":{},"fn":container.program(7, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":19,"column":0},"end":{"line":21,"column":7}}})) != null ? stack1 : "");
},"useData":true},
};

export const keyMined: TemplateCollection = {
  subject: {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "You have received a new NFT!";
},"useData":true},
  html: {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", alias4=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<h1>You have received a new NFT!</h1>\n\n<p>A new membership (#"
    + alias4(((helper = (helper = lookupProperty(helpers,"keyId") || (depth0 != null ? lookupProperty(depth0,"keyId") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"keyId","hash":{},"data":data,"loc":{"start":{"line":3,"column":22},"end":{"line":3,"column":31}}}) : helper)))
    + ") to the lock <strong>"
    + alias4(((helper = (helper = lookupProperty(helpers,"lockName") || (depth0 != null ? lookupProperty(depth0,"lockName") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"lockName","hash":{},"data":data,"loc":{"start":{"line":3,"column":53},"end":{"line":3,"column":65}}}) : helper)))
    + "</strong> was just minted for you!</p>\n\n"
    + alias4((lookupProperty(helpers,"formattedCustomContent")||(depth0 && lookupProperty(depth0,"formattedCustomContent"))||alias2).call(alias1,"Membership Manager",(depth0 != null ? lookupProperty(depth0,"customContent") : depth0),{"name":"formattedCustomContent","hash":{},"data":data,"loc":{"start":{"line":5,"column":0},"end":{"line":5,"column":61}}}))
    + "\n\n<p>It has been added to your <a href=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"keychainUrl") || (depth0 != null ? lookupProperty(depth0,"keychainUrl") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"keychainUrl","hash":{},"data":data,"loc":{"start":{"line":7,"column":38},"end":{"line":7,"column":53}}}) : helper)))
    + "\">Unlock Keychain</a>, where you can view it and, if needed, print it as a signed QR Code!</p>\n\n"
    + alias4((lookupProperty(helpers,"links")||(depth0 && lookupProperty(depth0,"links"))||alias2).call(alias1,(depth0 != null ? lookupProperty(depth0,"txUrl") : depth0),(depth0 != null ? lookupProperty(depth0,"openSeaUrl") : depth0),true,{"name":"links","hash":{},"data":data,"loc":{"start":{"line":9,"column":0},"end":{"line":9,"column":31}}}))
    + "\n\n"
    + alias4((lookupProperty(helpers,"transactionLink")||(depth0 && lookupProperty(depth0,"transactionLink"))||alias2).call(alias1,(depth0 != null ? lookupProperty(depth0,"transactionReceiptUrl") : depth0),{"name":"transactionLink","hash":{},"data":data,"loc":{"start":{"line":11,"column":0},"end":{"line":11,"column":41}}}))
    + "\n\n";
},"useData":true},
};

export const keyOwnership: TemplateCollection = {
  subject: {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "Your proof of key ownership for \""
    + container.escapeExpression(((helper = (helper = lookupProperty(helpers,"lockName") || (depth0 != null ? lookupProperty(depth0,"lockName") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"lockName","hash":{},"data":data,"loc":{"start":{"line":1,"column":33},"end":{"line":1,"column":45}}}) : helper)))
    + "\"";
},"useData":true},
  html: {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", alias4=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<h1>QR Code</h1>\n\n    <p>The QR code attached to this email proves that you own a key for <strong>"
    + alias4(((helper = (helper = lookupProperty(helpers,"lockName") || (depth0 != null ? lookupProperty(depth0,"lockName") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"lockName","hash":{},"data":data,"loc":{"start":{"line":3,"column":80},"end":{"line":3,"column":92}}}) : helper)))
    + "</strong>.</p>\n\n    <p>If you're asked to prove that you own this NFT, simply show the QR code attached to this email. The signature contained in this QR code has a timestamp, so if it's been a very long time you may want to generate a fresher code <a href=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"keychainLink") || (depth0 != null ? lookupProperty(depth0,"keychainLink") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"keychainLink","hash":{},"data":data,"loc":{"start":{"line":5,"column":242},"end":{"line":5,"column":258}}}) : helper)))
    + "\">on your keychain</a>.</p>\n";
},"useData":true},
};

export const nextAuthCode: TemplateCollection = {
  subject: {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "Your Unlock Verification Code";
},"useData":true},
  html: {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<h1 style=\"text-align: center;\">Your Unlock Login Verification Code</h1>\n    \n    <p>Hello!</p>\n\n    <p>To continue logging into your Unlock account, please use the following verification code:</p>\n\n    "
    + container.escapeExpression((lookupProperty(helpers,"verificationCode")||(depth0 && lookupProperty(depth0,"verificationCode"))||container.hooks.helperMissing).call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"code") : depth0),{"name":"verificationCode","hash":{},"data":data,"loc":{"start":{"line":7,"column":4},"end":{"line":7,"column":29}}}))
    + "\n\n    <p>This code expires in 10 minutes. Do not share this code with anyone. Please enter it promptly on the login page.</p>\n\n    <p>If you did not attempt to log in to your Unlock account, please ignore this email or contact support if you believe this is an unauthorized attempt.</p>\n\n    <p>Thank you for using Unlock!</p>\n";
},"useData":true},
};

export const transferCode: TemplateCollection = {
  subject: {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "Your Transfer Code is Here";
},"useData":true},
  html: {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", alias4=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "\n<h1> Your Transfer Code is Here </h1>\n\n<p> Your transfer code for "
    + alias4(((helper = (helper = lookupProperty(helpers,"lockName") || (depth0 != null ? lookupProperty(depth0,"lockName") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"lockName","hash":{},"data":data,"loc":{"start":{"line":4,"column":27},"end":{"line":4,"column":39}}}) : helper)))
    + " NFT has been successfully generated and is ready for you to use. This code will enable you to transfer your NFT for a limited period of "
    + alias4(((helper = (helper = lookupProperty(helpers,"validPeriod") || (depth0 != null ? lookupProperty(depth0,"validPeriod") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"validPeriod","hash":{},"data":data,"loc":{"start":{"line":4,"column":176},"end":{"line":4,"column":191}}}) : helper)))
    + ". </p>\n\n<p style=\"text-align: center\">\n<code style=\"font-size: 2em;\">"
    + alias4(((helper = (helper = lookupProperty(helpers,"transferCode") || (depth0 != null ? lookupProperty(depth0,"transferCode") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"transferCode","hash":{},"data":data,"loc":{"start":{"line":7,"column":30},"end":{"line":7,"column":46}}}) : helper)))
    + "</code> \n</p>\n<p>Please, use it as soon as possible to ensure a successful transfer. </p>\n\n\n";
},"useData":true},
};

export const welcome: TemplateCollection = {
  subject: {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "Welcome to Unlock!";
},"useData":true},
  html: {"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    return "<h1>Welcome to Unlock!</h1> \n    \n    <p>We're excited to have you with us!</p>\n    <p>If you have any questions or need assistance, our support team is here to help. You can reach us via <a href=\"https://discord.unlock-protocol.com/\">Discord</a>.</p>\n    <p>Welcome aboard, and we look forward to serving you!</p>\n    <p>Best Regards,</p>\n    <p>The Unlock Team</p>\n";
},"useData":true},
};

