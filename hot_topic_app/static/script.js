document.addEventListener('DOMContentLoaded', () => {
    const trendsContainer = document.getElementById('trends-container');
    const recommendationsContainer = document.getElementById('recommendations-container');
    const lastUpdated = document.getElementById('last-updated');
    const countrySelect = document.getElementById('country-select');
    const categorySelect = document.getElementById('category-select');
    const API_TRENDS_URL = '/api/trends';
    const API_RECOMMENDATIONS_URL = '/api/recommendations';

    async function fetchTrends(country, category) {
        trendsContainer.innerHTML = '<p>Loading trends...</p>'; // Show loading message
        lastUpdated.textContent = ''; // Clear last updated info

        try {
            const response = await fetch(`${API_TRENDS_URL}?country=${country}&category=${category}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const trends = await response.json();

            trendsContainer.innerHTML = ''; // Clear the loading message

            if (trends.error) {
                trendsContainer.innerHTML = `<p>Error fetching trends: ${trends.error}</p>`;
                return;
            }

            lastUpdated.textContent = `Last Updated: ${new Date().toLocaleString()}`;

            if (trends.length === 0) {
                trendsContainer.innerHTML = '<p>No trends found for the selected criteria.</p>';
                return;
            }

            trends.forEach(trend => {
                const trendItem = document.createElement('a');
                trendItem.className = 'trend-item';
                trendItem.href = trend.url;
                trendItem.target = "_blank";
                trendItem.rel = "noopener noreferrer";

                const rankElement = document.createElement('div');
                rankElement.className = 'trend-rank';
                rankElement.textContent = trend.rank;

                const imageContainer = document.createElement('div');
                imageContainer.className = 'trend-image-container';
                const image = document.createElement('img');
                image.src = trend.image || 'https://via.placeholder.com/150'; // Placeholder image
                image.alt = trend.title;
                imageContainer.appendChild(image);

                const contentContainer = document.createElement('div');
                contentContainer.className = 'trend-content';

                const titleElement = document.createElement('h3');
                titleElement.className = 'trend-title';
                titleElement.textContent = trend.title;

                const descriptionElement = document.createElement('p');
                descriptionElement.className = 'trend-description';
                descriptionElement.textContent = trend.description || 'No description available.';

                const sourceElement = document.createElement('div');
                sourceElement.className = 'trend-source';
                sourceElement.textContent = `Source: ${trend.source}`;

                contentContainer.appendChild(titleElement);
                contentContainer.appendChild(descriptionElement);
                contentContainer.appendChild(sourceElement);

                trendItem.appendChild(rankElement);
                trendItem.appendChild(imageContainer);
                trendItem.appendChild(contentContainer);

                trendsContainer.appendChild(trendItem);
            });

        } catch (error) {
            trendsContainer.innerHTML = `<p>Failed to fetch trends. Please ensure the server is running and check your network connection. Error: ${error.message}</p>`;
            console.error("Error fetching trends:", error);
        }
    }

    async function fetchRecommendations() {
        recommendationsContainer.innerHTML = '<p>Loading recommendations...</p>';
        try {
            const response = await fetch(API_RECOMMENDATIONS_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const recommendations = await response.json();
            console.log("Frontend received recommendations:", recommendations); // Debug log

            recommendationsContainer.innerHTML = '';

            if (recommendations.error) {
                recommendationsContainer.innerHTML = `<p>Error fetching recommendations: ${recommendations.error}</p>`;
                return;
            }

            if (recommendations.length === 0) {
                recommendationsContainer.innerHTML = '<p>No recommendations found at this time.</p>';
                return;
            }

            recommendations.forEach((rec, index) => {
                const recItem = document.createElement('a');
                recItem.className = 'trend-item recommendation-item'; // Add a specific class for styling
                recItem.href = rec.url;
                recItem.target = "_blank";
                recItem.rel = "noopener noreferrer";

                const rankElement = document.createElement('div');
                rankElement.className = 'trend-rank';
                rankElement.textContent = rec.rank || (index + 1); // Use index + 1 as fallback for rank

                const imageContainer = document.createElement('div');
                imageContainer.className = 'trend-image-container';
                const image = document.createElement('img');
                image.src = rec.image || 'https://via.placeholder.com/150';
                image.alt = rec.title;
                imageContainer.appendChild(image);

                const contentContainer = document.createElement('div');
                contentContainer.className = 'trend-content';

                const titleElement = document.createElement('h3');
                titleElement.className = 'trend-title';
                titleElement.textContent = rec.title;

                const descriptionElement = document.createElement('p');
                descriptionElement.className = 'trend-description';
                descriptionElement.textContent = rec.description || 'No description available.';

                const sourceElement = document.createElement('div');
                sourceElement.className = 'trend-source';
                sourceElement.textContent = `Source: ${rec.source}`;

                contentContainer.appendChild(titleElement);
                contentContainer.appendChild(descriptionElement);
                contentContainer.appendChild(sourceElement);

                recItem.appendChild(rankElement);
                recItem.appendChild(imageContainer);
                recItem.appendChild(contentContainer);

                recommendationsContainer.appendChild(recItem);
                console.log("Appended recommendation item:", recItem); // Debug log
            });

        } catch (error) {
            recommendationsContainer.innerHTML = `<p>Failed to fetch recommendations. Error: ${error.message}</p>`;
            console.error("Error fetching recommendations:", error);
        }
    }

    // Event Listeners for filters
    countrySelect.addEventListener('change', () => {
        fetchTrends(countrySelect.value, categorySelect.value);
    });

    categorySelect.addEventListener('change', () => {
        fetchTrends(countrySelect.value, categorySelect.value);
    });

    // Initial fetches on page load
    fetchTrends(countrySelect.value, categorySelect.value);
    fetchRecommendations();
});