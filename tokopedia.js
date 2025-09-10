// tokopedia.js
import fetch from "node-fetch";

const url = "https://gql.tokopedia.com"; // Tokopedia GraphQL endpoint

const query = `
  query GetHomeRecommendation {
    getHomeRecommendationCard {
      cards {
        id
        name
        rating
        ratingAverage
        url
        imageUrl
        price
        priceInt
        slashedPrice
        slashedPriceInt
        discountPercentage
        categoryBreadcrumbs
      }
    }
  }
`;

let globalIndex = 1; // counter across all runs

async function scrapeTokopedia(runNumber) {
    try {
        const res = await fetch(url, {
            method: "POST",
            headers: {
                "content-type": "application/json",
                "accept": "application/json",
                "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
            },
            body: JSON.stringify({
                query,
                variables: {},
            }),
        });

        const data = await res.json();

        const cards = data?.data?.getHomeRecommendationCard?.cards;
        if (!cards) {
            console.log(`Run ${runNumber}: No product cards found.`);
            return;
        }

        console.log(`=== Tokopedia Products (Run ${runNumber}) ===`);
        cards.forEach((card) => {
            // use Int values for calculation
            const finalPrice = card.priceInt;
            const originalPrice = card.slashedPriceInt || 0;

            // calculate discounted price (difference)
            const discountValue = originalPrice > 0 ? originalPrice - finalPrice : 0;

            console.log(`${globalIndex}. ${card.name}`);
            console.log(`   ID: ${card.id}`);
            console.log(`   Product Name: ${card.name}`);
            console.log(`   Final price: ${card.price}`);
            console.log(`   Original Price: ${card.slashedPrice || null}`);
            if (discountValue > 0) {
                console.log(`   Discount Value: Rp${discountValue.toLocaleString("id-ID")}`);
            } else {
                console.log(`   Discount Value: None`);
            }
            console.log(`   Discount Percentage: ${card.discountPercentage}`);
            console.log(`   Category: ${card.categoryBreadcrumbs}`);
            console.log(`   URL: ${card.url}`);
            console.log(`   Rating: ${card.rating}`);
            console.log(`   Rating Average: ${card.ratingAverage}`);
            console.log("-----------------------------------");

            globalIndex++; // increment across runs
        });

    } catch (err) {
        console.error(`Error in run ${runNumber}:`, err);
    }
}

async function main() {
    const runs = 2; // how many times you want to repeat
    for (let i = 1; i <= runs; i++) {
        await scrapeTokopedia(i);
    }
}

main();
