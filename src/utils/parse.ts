import { ChatCompletionMessageParam } from "openai/resources/chat"
import { addLogEntry } from "./supabase"

export const parseOpenAIStreamingResponse = (response: string) => {
  const events = response.split("\n\n")
  let finalResponse = ""

  for (const event of events) {
    if (event.startsWith("data: [DONE]")) {
      break
    }
    if (event.startsWith("data: ")) {
      const jsonData = JSON.parse(event.slice(6))
      if (jsonData.choices && jsonData.choices[0].delta.content) {
        finalResponse += jsonData.choices[0].delta.content
      }
    }
  }
  return finalResponse
}

export const parseWebsearchResults = (
  messages: ChatCompletionMessageParam[]
):
  | {
      url: string
      content: string
    }[] => {
  const websearchMessage = messages.find(
    (msg) =>
      msg.role === "user" &&
      typeof msg.content === "string" &&
      msg.content.includes("### Potentially Relevant Websearch Results")
  )
  // console.log("websearchMessage", websearchMessage)
  // addLogEntry({
  //   type: "debug",
  //   messages,
  //   websearchMessage,
  // })

  if (!websearchMessage || typeof websearchMessage.content !== "string") {
    return []
  }

  const regex = /Website URL: (.*?)\s*Website content:([\s\S]*?)(?=\n____|\n$)/g
  const matches = [...websearchMessage.content.matchAll(regex)]

  return matches.map((match) => ({
    url: match[1],
    content: match[2].trim(),
  }))
}

// const testMessages = [
//   {
//     role: "system",
//     content:
//       'You are an intelligent programmer, powered by GPT-4o. You are happy to help answer any questions that the user has (usually they will be about coding).\n\n1. Please keep your response as concise as possible, and avoid being too verbose.\n\n2. When the user is asking for edits to their code, please output a simplified version of the code block that highlights the changes necessary and adds comments to indicate where unchanged code has been skipped. For example:\n```language:path/to/file\n// ... existing code ...\n{{ edit_1 }}\n// ... existing code ...\n{{ edit_2 }}\n// ... existing code ...\n```\nThe user can see the entire file, so they prefer to only read the updates to the code. Often this will mean that the start/end of the file will be skipped, but that\'s okay! Rewrite the entire file only if specifically requested. Always provide a brief explanation of the updates, unless the user specifically requests only the code.\n\n3. Do not lie or make up facts.\n\n4. If a user messages you in a foreign language, please respond in that language.\n\n5. Format your response in markdown.\n\n6. When writing out new code blocks, please specify the language ID after the initial backticks, like so: \n```python\n{{ code }}\n```\n\n7. When writing out code blocks for an existing file, please also specify the file path after the initial backticks and restate the method / class your codeblock belongs to, like so:\n```language:some/other/file\nfunction AIChatHistory() {\n    ...\n    {{ code }}\n    ...\n}\n```\n\n8. If search results are provided, you should respond as if this information is known to you. Refrain from saying "I am unable to browse the internet", "I don\'t have access to the internet", or "I\'m unable to provide real-time news updates." Please always cite any links from the search results that you include in your response in markdown format.',
//   },
//   {
//     role: "user",
//     content:
//       "# Inputs\n\n### Potentially Relevant Websearch Results\n\n-------\n\nWebsite URL: https://www.mindtheproduct.com/how-to-price-your-subscription-product-insights-and-examples-yuri-berchenko-product-partnerships-youtube/?utm_source=oneoneone\nWebsite content:\nGuest Post\n\n# How to price your subscription product: insights and examples\n\nYuri Berchenko, Product Partnerships Lead at YouTube outlines a few common strategies and models for setting pricing and shares practical tips and real-world examples. \n\nAugust 29, 2024\n\n16 min read\n\nShare on\n\n### Yuri Berchenko\n\nYuri has 15 years of product management and business development experience in the digital industry. He is passionate about driving innovation and achieving business growth through strategic partnerships and product development. Over the years Yuri has held several senior roles at Google and YouTube where he successfully launched products and scaled them globally through powerful partnerships in the telecommunications sector as well as in the entertainment industry, including music, media and gaming.\n\nRead more by Yuri »\n\nHow do you set your subscription pricing? You might look at your competitors' pricing structure and set yours similarly. Alternatively, you may work out your costs and add a little margin. Finally, you could be just relying on your intuition. All these approaches can work — but all of them also can leave a lot of your money on the table. You already may have read a lot that the most profitable pricing strategies put customer value front and center, and that they should be driven by data, and match your customers' purchasing and usage habits. Certainly, right pricing - especially for subscription products - is not pulled out of thin air. Pricing is hard, and in this article I will outline a few common strategies and models for setting your pricing, and give a few practical advice on what to consider to get your price just right. \n\nIn the subscription-based pricing model, customers pay regularly for a service or product, most commonly a monthly fee. Subscription pricing is different from pricing for traditional products, as pricing is often based on the subscription length, making longer subscriptions the cheapest option.\n\nThe amount you charge for products or services should be taken seriously, yet many businesses do not take the time to consider this properly. Many companies with a subscription business model may spend less than ten hours each year on their pricing. This happens for several reasons, such as pressure to acquire new customers instead of optimizing the value of those they already have, a lack of knowledge on how to price, failure to invest in collecting customer data, and many more. \n\nHowever, even if you spend double that amount of time on your pricing strategy, if you're not also avoiding the following one mistake, you could be charging less than you should. \n\nThe most common mistake almost all companies make when working on pricing is that they update their pricing infrequently. The study from Profit Well, a US-based subscription revenue optimization platform, proved that companies performing regular price changes are seeing much higher ARPU growth relative to their ARPU five years ago. \n\nOut of 3,200 companies analyzed, those which have not changed the price in the last 3 years have not demonstrated any ARPU growth and in a contrast those who change price every 6 months or at least yearly demonstrated ARPU growth of +30% and +60% respectively (see chart below). \n\n**Figure 1\\\\. Price changes correlation with ARPU** \n\nSource: “Why you should change your pricing every 6 months” by Profit Well \n\nHere are 2 simple reasons why companies that change prices more often have a higher ARPU: \n\nA visible illustration of frequent pricing changes is streaming. All streaming services are getting a little more expensive all the time. Netflix has raised the cost of its subscription multiple times since its launch, so did other major services. \n\n**Figure 2\\\\. Price changes of selected streaming services in the US (2017 - 2023, indexed)**\n\nThe four common subscription pricing examples for subscription companies are fixed rate, tiered, per-user, and usage-based. Each pricing model works best in different situations and scales according to different factors. Choosing the right model can make or break your profit margin. \n\nThis model is the most commonly used with software and B2B products and services. According to the research done by Matrix Partners in collaboration with KeyBank, per-user pricing (also called _per-seat_ or _per-unit_) is the go-to subscription business model for the majority of companies. The researchers surveyed 385 private B2B software companies working in the United States and 39% named “Seats” as their primary pricing metric. \n\nIn per-user pricing, price scales evenly along with the number of users - the more users, the more you charge, so the pricing scales proportionally as the number of users grows. Per-user pricing is best for frequently used products that may require collaboration or teamwork but limited to only a few users. \n\nQwilr makes business software that allows users to create sales and business proposals easily. Its pricing model is simple: $35 per user per month for businesses. \n\n**Figure 3\\\\. Qwirl per-user model offers convenience for customers that may not need enterprise-level pricing.** \n\nSource: Qwilr\n\nPer-user pricing is easy for potential buyers to understand, simplifying the sales process. It also makes forecasting monthly recurring revenue (MRR) straightforward since revenue scales in direct proportion to the number of users. \n\nPer-user pricing is best for frequently used products that may require collaboration or teamwork but limited to only a few users, but it does have downsides, though. For example, if hundreds of people need to use the software, the per-user model is not cost-effective for customers. Also charging per seat can lead to users sharing logins across teams, cutting into your potential revenue. \n\nUsage-based pricing model, sometimes called pay-as-you-go, is somewhat less common among digital and software businesses - it's mainly used by telecommunications companies and IT services. Users are charged based on how much of a product or service they consume: for example Google Maps Platform priced their services based on API calls per month: submit 100,000 requests to Air Quality API, for example, and you'll be charged for exactly this 100,000 calls. \n\n**Figure 4\\\\. Google Maps Platform charges based on the number of API requests each month.**\n\nSource: Google Maps Platform\n\nTying pricing to usage makes it easier for small companies to get started with your product while avoiding the high upfront monthly or yearly fees charged by some subscription companies. On the other end of the scale, it also accounts for additional costs incurred by heavy users, charging them fairly based on the extra time and resources they consume. Charging based on usage does, however, make it much harder to predict revenue since billing can vary dramatically each month.\n\nTiered pricing allows companies to offer multiple packages with different features and product combinations available at different price points. The number of packages can vary, but most subscription companies offer two or three pricing tiers. This is a great model for software or streaming companies that want to offer their customers flexibility. \n\nFor example, the most known company which works on a tiered pricing model is Netflix. It offers customers several options when signing up for its services and depending on the country this generally offers various prices based on the number of devices you are going to watch the service. \n\nAnother great example is Sprout Social, a U.S.-based social media management platform. Company designs its tiers around the needs of different customers, whether they're professionals who need \"essential tools\" or companies looking for advanced tools \"at scale.\" \n\n**Figure 5\\\\. Sprout Social's tiered pricing model offers different combinations of features across their three packages.**\n\nSource: Sprout Social\n\nBy catering to multiple buyer personas at multiple price points, Sprout Social can maximize how much revenue they can extract from each customer while providing an easy upsell opportunity for long-term users as companies outgrow each tier. \n\nBeyond two or three options, however, things start to go downhill - offering too many choices leads to indecision and lower sales. It's easy to try appealing to customer types with varying budgets by adding more tiers, but this leads to 'analysis paralysis' and lost sales.\n\nFixed-rate pricing is also sometimes called flat-rate and it stays simple: a single product, a fixed set of features, and the company charges the customer a regular fee for the product or service. Amazon Prime is probably one of the most well-known examples of flat-rate pricing for subscriptions. The fee doesn't change no matter how much or how little the customer uses the subscription benefits. \n\nA great example of fixed-rate pricing is Basecamp, a web-based project management software company from Chicago. Company’s product has no tiers and is offered with a flat-rate pricing disregard any usage frequency and without any limitations to number of seats. \n\n**Figure 6\\\\. Basecamp offers flat-rate pricing on its project management software.**\n\nSource: Basecamp\n\nFlat-rate pricing is easier to communicate and easier to sell. If you're adding valuable features, simply raise your rate. If you add additional products, the fixed price goes on top of your base fixed rate. It has been the core of the Dollar Shave Club's initial success, when they offered a simple $1 per month flat rate and this model is being also used by many of the streaming services.\n\nBut while flat-rate subscription pricing might be easy for potential customers to understand, it often means leaving money on the table. Keeping prices low means missing out on additional revenue from larger companies and vice-versa; smaller companies might be priced out of higher-cost tools.\n\nIt is also possible to combine several pricing models simultaneously. Let me show you how YouTube combines a _tiered pricing model_ with some elements of _per-user_ and _fixed rate_ pricing. \n\nThere are two paid subscription services offered by YouTube:\n\nIf you look at each of these products individually, you may fairly assume we use a _fixed-rate pricing model_, as this model is also being used by many of the streaming services. Price stays the same disregarding neither the number of devices you are going to watch the service on nor how many hours of content you are going to consume every day. \n\n**Figure 7\\\\. YouTube tiered pricing model offers unique combinations of features to different customer segments.** \n\nSource: YouTube paid memberships\n\nHowever, if you look at YouTube’s paid products from a different angle, you may notice that it can be also positioned as two tiers of the same service. YouTube Music Premium is a lower tier and YouTube Premium is a higher tier and being positioned as a flagship SKU, mainly because all benefits of YouTube Music Premium are also available to subscribers of YouTube Premium. From this perspective, you may fairly conclude that YouTube uses the _tiered pricing model_. \n\nAnd lastly there are elements of the _per-user pricing model_ which is seen when you compare our _Individual_ plan with the _Family_ plan. Even though we do not make the price to depend on the number of the devices (like Netflix for example), we do scale the price proportionally to the number of users, similarly to Spotify or Apple Music. \n\n**Figure 9\\\\. YouTube’s per-user pricing model allows it to differentiate between individual and household users.** \n\nSource: YouTube paid memberships\n\nIt goes without saying that different situations call for different pricing models. \n\nFirst, work out an in-depth understanding of your customer’s profile. Customers who value simplicity might prefer a fixed or tiered pricing scheme over a usage-based one, for example. So the direct route to a successful pricing model is to define your customer segments. These questions may help you to structure your mind around it: \n\nUnderstanding your customer segments helps define which pricing model you choose and how much you charge. Match each tier's pricing and feature set to your primary customer segments instead of simply choosing tiers based on which features you want to include.\n\nSecond, make sure you do 360-degree regular research about how your competition prices their products. This should never be the only pricing strategy you use, but it's important to know. Two simple things to consider: \n\nFreemium tiers and free trials both give potential buyers a chance to try your product before they buy. But keep in mind the freemium model is an effective customer acquisition tool, but not a revenue methodology, so often they are not suitable for early-stage startups.\n\nGiving users multiple options when signing up for your product might sound basic, but many companies only offer two tiers: “cheap” and “expensive”. Very often the second tier is useless or expensive and overpowered, and almost by design is not valuable to buyers. If you're using a tiered pricing model, keep users in mind and make sure your offerings match your users' needs, not your own. \n\nIt's nearly impossible to predict how many resources each customer will use in any given month. If you discover your resource demands frequently exceed your expectations, try charging based on usage instead. Giving customers the ability to pay only for what they use can help you recover costs easier than increasing pricing across the board. \n\nGiving customers the ability to upgrade their accounts as they grow can help grow your customer lifetime value. Look for add-ons that either increase revenue or retention (or both!). Hypothetically, in most cases at least 30% of your customer base would be willing to consider an upgrade. If your customers seem to be hitting a wall in their basic plan, send them a personal email or chat to show them your premium offerings may hold up better. \n\nThe current market environment is characterized by increased competition making customer acquisition costs higher than they ever were before and at the same time struggling to succeed with customer retention and loyalty. Product and marketing teams spend hours in workshops desperately looking on how to improve their product and tweak their positioning. \n\nAnd in these environments teams tend to spend precious little time thinking about their pricing. But while pricing discussions are often overshadowed by acquisition, higher pricing is one of the most powerful levers for revenue growth, it has a significantly larger impact than improving other areas like acquisition or retention.\n\nBut business metrics aside, when you put your end user in the center, your price is the crudest and the most subtle message you can send about your product, so it's worth getting it right. \n\n**Disclaimer.** The opinions expressed in this publication are solely those of the authors. They neither reflect nor purport to reflect the opinions or views of YouTube, Google, Alphabet Inc., their respective parent companies or affiliates or the companies with which the authors are affiliated and may have been previously disseminated by them. The authors opinions are based upon information they consider reliable, but neither YouTube nor Google, nor Alphabet Inc., nor their affiliates or parent companies, nor the companies with which the authors are affiliated warrant its completeness or accuracy and it should not be relied upon as such.\n\n## Read more\n\n Explore all topic content\n\nThe five dysfunctions of a product manager\n\nAndy Hughes\n\n\\\\- 3 min read\n\nWhy mistakes are key for product excellence\n\nFrancesca Cortesi\n\n\\\\- 5 min read\n\nThe (Def)inition Lab: Our recipe for reducing the risk of product failure\n\nIsabelle Berner\n\n\\\\- 9 min read\n\nEssential KPIs for data-driven product managers\n\nJohn Allen\n\n\\\\- 9 min read\n\n## Comments\n\nJoin the community\n\nSign up for free to share your thoughts\n\nSign up for free\n\nAlready have an account? Sign in \n\nMind the Product\n\nPresented by \n\nPendo\n\n##### Become a better product manager\n\nLearn from product experts and become part of the world’s most engaged community for product managers\n\nCompany\n\nAbout usOur manifestoContact usCareers\n\nGet involved\n\nJoin an eventJoin us on SlackDiscover Pendo resources\n\nContribute\n\nSponsor Mind the ProductWrite for Mind the ProductSpeak at Mind the Product\n\nFollow us\n\nTwitter Facebook LinkedIn YouTube Instagram\n\nPrivacy PolicyTerms and ConditionsManage PreferencesCode of ConductFAQ\n\nMind the Product is brought to you byPendo\n\n© 2024 Pendo.io, Inc. All rights reserved. Pendo trademarks, product names, logos and other marks and designs are trademarks of Pendo.io, Inc. or its subsidiaries and may not be used without permission.\n____\n\n\nYou should respond as if these information are known to you. Reframe from saying \"I am unable to browse the internet\" or \"I don't have access to the internet\" or \"I'm unable to provide real-time news updates\". This is your internet search results. Please always cite any links you referenced from the above search results in your response in markdown format.\n",
//     name: "potential_context",
//   },
//   {
//     role: "user",
//     content:
//       "\n\nSummarize @https://www.mindtheproduct.com/how-to-price-your-subscription-product-insights-and-examples-yuri-berchenko-product-partnerships-youtube/?utm_source=oneoneone ",
//   },
// ]

// console.log(parseWebsearchResults(testMessages as ChatCompletionMessageParam[]))
