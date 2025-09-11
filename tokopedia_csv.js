// tokopedia.js
import fetch from "node-fetch";
import fs from "fs";

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
let allProducts = []; // collect all results

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
            const finalPrice = card.priceInt;
            const originalPrice = card.slashedPriceInt || 0;
            const discountValue = originalPrice > 0 ? originalPrice - finalPrice : 0;

            // calculate discount % (from values)
            const discountPercentCalc =
                originalPrice > 0 ? Math.round((discountValue / originalPrice) * 100) : 0;

            // console.log(`${globalIndex}. ${card.name}`);

            // Push product into our array
            allProducts.push({
                index: globalIndex,
                id: card.id,
                productName: card.name,
                finalPrice: card.price,
                originalPrice: card.slashedPrice || null,
                discountValue: discountValue > 0 ? `Rp${discountValue.toLocaleString("id-ID")}` : "None",
                discountPercentage: discountPercentCalc, // calculated manually
                category: card.categoryBreadcrumbs,
                url: card.url,
                rating: card.rating,
                ratingAverage: card.ratingAverage,
            });

            console.log('Total Product:', allProducts.length)

            globalIndex++;
        });
    } catch (err) {
        console.error(`Error in run ${runNumber}:`, err);
    }
}

function saveToCSV(data, filename) {
    const headers = Object.keys(data[0]).join(",") + "\n";
    const rows = data
        .map((obj) =>
            Object.values(obj)
                .map((val) => `"${String(val).replace(/"/g, '""')}"`) // escape quotes
                .join(",")
        )
        .join("\n");

    fs.writeFileSync(filename, headers + rows, "utf-8");
    console.log(`✅ CSV saved as ${filename}`);
}

function removeDuplicates(products) {
    const seen = new Set();
    return products.filter((p) => {
        if (seen.has(p.id)) return false;
        seen.add(p.id);
        return true;
    });
}

async function main() {
    const runs = 50; // keep 2 runs if you want
    for (let i = 1; i <= runs; i++) {
        await scrapeTokopedia(i);
    }

    if (allProducts.length > 0) {
        const uniqueProducts = removeDuplicates(allProducts); // ✅ filter dupes
        saveToCSV(uniqueProducts, "tokopedia.csv");
    } else {
        console.log("⚠️ No products to save.");
    }
}

main();
