CURRENT FLOW
Main func flow starts with:
- processShows()
1. Fetch sections from plex server (rewrite this, see comments)
2. Get shows from sectionData (rewrite should touch this as well)
3. add shows to a list
- 
4. pulls in shows from local file back in processShows()
5. Maps local shows into shape
6. loads order from local file
7. orders and returns full dataset