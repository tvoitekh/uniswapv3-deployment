import dash
from dash import html, dcc
import dash_cytoscape as cyto
from dash.dependencies import Input, Output
import dash_bootstrap_components as dbc
import math

# Initialize the Dash app
app = dash.Dash(__name__, external_stylesheets=[dbc.themes.BOOTSTRAP])

# Define nodes with hover information and appropriate sizes
nodes = [
    {'data': {'id': 'Governance', 'label': 'Governance', 'info': 'Oversees protocol governance, manages liquidity incentive programs, and sets fee tiers.'}, 'position': {'x': 100, 'y': 50}, 'classes': 'rectangle'},
    {'data': {'id': 'Pool Deployer', 'label': 'Pool Deployer', 'info': 'Deploys new liquidity pools and handles initial pool setup.'}, 'position': {'x': 300, 'y': 50}, 'classes': 'rectangle'},
    {'data': {'id': 'Pool Factory', 'label': 'Pool Factory', 'info': 'Central factory contract for creating new pool contracts.'}, 'position': {'x': 500, 'y': 50}, 'classes': 'rectangle'},
    {'data': {'id': 'Pools', 'label': 'Pools', 'info': 'Liquidity pools where users provide liquidity and where trades occur.'}, 'position': {'x': 700, 'y': 50}, 'classes': 'rectangle'},
    {'data': {'id': 'Quoter', 'label': 'Quoter', 'info': 'Provides on-chain price quotes for swaps without executing them.'}, 'position': {'x': 900, 'y': 50}, 'classes': 'rectangle'},
    {'data': {'id': 'Tick Lens', 'label': 'Tick Lens', 'info': 'Allows retrieval of tick data for analyzing price movements and liquidity.'}, 'position': {'x': 1100, 'y': 50}, 'classes': 'rectangle'},
    {'data': {'id': 'Nonfungible Position Manager', 'label': 'Nonfungible Position Manager', 'info': 'Manages nonfungible token (NFT) representations of liquidity positions.'}, 'position': {'x': 500, 'y': 200}, 'classes': 'ellipse'},
    {'data': {'id': 'Nonfungible Token Position Descriptor', 'label': 'Nonfungible Token Position Descriptor', 'info': 'Provides detailed information about nonfungible token positions.'}, 'position': {'x': 700, 'y': 200}, 'classes': 'ellipse'},
    {'data': {'id': 'Router', 'label': 'Router', 'info': 'Handles routing of swaps between different pools and tokens.'}, 'position': {'x': 900, 'y': 200}, 'classes': 'rectangle'},
    {'data': {'id': 'Staker', 'label': 'Staker', 'info': 'Enables users to stake their liquidity position NFTs to earn additional rewards.'}, 'position': {'x': 100, 'y': 200}, 'classes': 'rectangle'},
    {'data': {'id': 'Users', 'label': 'Users', 'info': 'Provide liquidity to pools, perform swaps, and interact with other protocol components.'}, 'position': {'x': 300, 'y': 200}, 'classes': 'ellipse'},
]

# Define edges with hover information
edges = [
    {'data': {'source': 'Governance', 'target': 'Staker', 'label': 'Manage liquidity incentive programs'}},
    {'data': {'source': 'Governance', 'target': 'Pool Deployer', 'label': 'Create new fee tiers'}},
    {'data': {'source': 'Governance', 'target': 'Pool Factory', 'label': 'Create new fee tiers'}},
    {'data': {'source': 'Governance', 'target': 'Pools', 'label': 'Manage individual pool fees'}},
    {'data': {'source': 'Pool Deployer', 'target': 'Pool Factory', 'label': 'Low Level Deploy'}},
    {'data': {'source': 'Pool Factory', 'target': 'Pools', 'label': 'Deploy new contract'}},
    {'data': {'source': 'Users', 'target': 'Nonfungible Position Manager', 'label': 'Liquidity Actions'}},
    {'data': {'source': 'Users', 'target': 'Staker', 'label': 'Stake LP NFT'}},
    {'data': {'source': 'Users', 'target': 'Pool Deployer', 'label': 'High Level Deploy'}},
    {'data': {'source': 'Nonfungible Position Manager', 'target': 'Users', 'label': 'LP NFTs'}},
    {'data': {'source': 'Nonfungible Position Manager', 'target': 'Pools', 'label': 'Liquidity Actions'}},
    {'data': {'source': 'Nonfungible Position Manager', 'target': 'Nonfungible Token Position Descriptor', 'target-arrow-shape': 'triangle-back'}},
    {'data': {'source': 'Nonfungible Token Position Descriptor', 'target': 'Nonfungible Position Manager', 'target-arrow-shape': 'triangle-back'}},
    {'data': {'source': 'Router', 'target': 'Pools', 'label': 'Low-level swap'}},
    {'data': {'source': 'Quoter', 'target': 'Pools', 'label': 'Price Quote'} , 'classes': 'dashed-edge'},
    {'data': {'source': 'Tick Lens', 'target': 'Pools', 'label': 'Tick Data'} , 'classes': 'dashed-edge'},
    {'data': {'source': 'Staker', 'target': 'Users', 'label': 'UNI token rewards'}},
    {'data': {'source': 'Users', 'target': 'Router', 'label': 'High-level swap'}}
]

def calculate_font_size(node_width, node_height):
    """
    Calculate font size based on node width and height.
    Adjust the font size dynamically.
    """
    # Calculate the area of the node
    node_area = node_width * node_height
    
    # You can adjust this factor according to your preference
    area_factor = 0.01
    
    # Calculate font size based on node area
    font_size = math.sqrt(node_area) * area_factor
    
    return max(font_size, 10)  # Ensure font size is not less than 10

# Define the stylesheet for nodes and edges
stylesheet = [
    {
        'selector': 'node',
        'style': {
            'label': 'data(label)',
            'width': '100px',
            'height': '100px',
            'background-color': '#2ECC71',
            'color': 'white',
            'font-size': 'data(font_size)',
            'text-valign': 'center',
            'text-halign': 'center',
            'shape': 'data(shape)',
            'padding': '10px',
            'text-wrap': 'wrap',  # Wrap text when it crosses node shape
            'text-max-width': '90px'  # Limit the width of the text to fit within the node
        }
    },
    {
        'selector': 'edge',
        'style': {
            'label': 'data(label)',
            'width': 3,
            'line-color': '#3498DB',
            'target-arrow-shape': 'triangle',
            'target-arrow-color': '#3498DB',
            'arrow-scale': 1.5,
            'curve-style': 'bezier',
            'font-size': '10px',
            'text-background-opacity': 1,
            'text-background-color': '#FFFFFF',
            'text-background-shape': 'roundrectangle',
            'text-border-color': '#CCCCCC',
            'text-border-width': 1
        }
    },
    {
        'selector': '.rectangle',
        'style': {
            'shape': 'roundrectangle',
            'width': '120px',
            'height': '80px'
        }
    },
    
    {
        'selector': '.ellipse',
        'style': {
            'shape': 'ellipse',
            'width': '100px',
            'height': '100px'
        }
    },
    {
        'selector': 'edge[line-style="dashed"]',
        'style': {
            'line-style': 'dashed'
        }
    },
    {
        'selector': ':selected',
        'style': {
            'background-color': '#FF5733',
            'line-color': '#FF5733',
            'target-arrow-color': '#FF5733',
            'source-arrow-color': '#FF5733'
        }
    },
    {
        'selector': '.dashed-edge',
        'style': {
            'line-style': 'dashed' 
        }
    }
]

# Update nodes with font size data
for node in nodes:
    node_width = 100 if 'width' not in node['data'] else node['data']['width']  # Default width is 100 if not provided
    node_height = 100 if 'height' not in node['data'] else node['data']['height']  # Default height is 100 if not provided
    node['data']['font_size'] = calculate_font_size(node_width, node_height)

# Define the app layout
app.layout = dbc.Container([
    dbc.Row([
        dbc.Col([
            html.H1("Uniswap V3 Architecture Visualization", className='text-center mb-4'),
            cyto.Cytoscape(
                id='uniswap-v3-protocol',
                elements=nodes + edges,
                layout={'name': 'preset', 'userZoomingEnabled': True, 'userPanningEnabled': True},
                style={'width': '100%', 'height': '800px', 'background-color': '#F8F9FA', 'border-radius': '15px'},
                stylesheet=stylesheet,
                minZoom=0.5,
                maxZoom=2,
                autoungrabify=False,
                boxSelectionEnabled=False,
            ),
        ], width=9),
        dbc.Col([
            html.H2("Node Information", className='text-center'),
            html.Div(id='node-info', style={'padding': '20px', 'border': '1px solid #CCCCCC', 'border-radius': '15px', 'background-color': '#FFFFFF'})
        ], width=3)
    ])
], fluid=True)

# Callback for displaying hover information
@app.callback(
    Output('node-info', 'children'),
    [Input('uniswap-v3-protocol', 'tapNodeData')]
)
def display_node_info(node):
    if node:
        return dbc.Card([
            dbc.CardHeader(html.H4(node.get('label'))),
            dbc.CardBody([
                html.P(node.get('info'))
            ])
        ])
    return "Click on a node to see details."

# Run the app
if __name__ == '__main__':
    app.run_server(debug=True)
