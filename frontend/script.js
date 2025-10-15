document.addEventListener('DOMContentLoaded', () => {
    const trendsContainer = document.getElementById('trends-container');
    const lastUpdated = document.getElementById('last-updated');
    const API_URL = 'http://127.0.0.1:8000/api/trends';

    async function fetchTrends() {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const trends = await response.json();

            // Clear the loading message
            trendsContainer.innerHTML = '';

            if (trends.error) {
                trendsContainer.innerHTML = `<p>Error fetching trends: ${trends.error}</p>`;
                return;
            }

            // Update last updated time
            lastUpdated.textContent = `Last Updated: ${new Date().toLocaleString()}`;

            // Populate trends
            trends.forEach(trend => {
                const trendItem = document.createElement('div');
                trendItem.className = 'trend-item';

                const rankElement = document.createElement('div');
                rankElement.className = 'trend-rank';
                rankElement.textContent = trend.rank;

                const titleElement = document.createElement('div');
                titleElement.className = 'trend-title';
                titleElement.textContent = trend.title;

                trendItem.appendChild(rankElement);
                trendItem.appendChild(titleElement);

                trendsContainer.appendChild(trendItem);
            });

        } catch (error) {
            trendsContainer.innerHTML = `<p>Failed to connect to the API. Please ensure the backend server is running.</p>`;
            console.error("Error fetching trends:", error);
        }
    }

    fetchTrends();
});
