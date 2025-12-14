import json
import os
import base64
import requests
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Улучшение и восстановление фотографий с помощью AI
    Принимает изображение в base64, тип обработки и опциональный фильтр
    Возвращает обработанное изображение в base64
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    try:
        body_data = json.loads(event.get('body', '{}'))
        image_base64 = body_data.get('image')
        process_type = body_data.get('processType', 'enhance')
        filter_type = body_data.get('filterType')
        
        if not image_base64:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Image data required'}),
                'isBase64Encoded': False
            }
        
        api_token = os.environ.get('REPLICATE_API_TOKEN')
        if not api_token:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'API token not configured'}),
                'isBase64Encoded': False
            }
        
        model_map = {
            'enhance': 'tencentarc/gfpgan:0fbacf7afc6c144e5be9767cff80f25aff23e52b0708f17e20f9879b2f21516c',
            'restore': 'tencentarc/gfpgan:0fbacf7afc6c144e5be9767cff80f25aff23e52b0708f17e20f9879b2f21516c',
            'filter': 'tencentarc/gfpgan:0fbacf7afc6c144e5be9767cff80f25aff23e52b0708f17e20f9879b2f21516c'
        }
        
        model_id = model_map.get(process_type, model_map['enhance'])
        
        data_uri = f"data:image/jpeg;base64,{image_base64}"
        
        prediction_response = requests.post(
            'https://api.replicate.com/v1/predictions',
            headers={
                'Authorization': f'Token {api_token}',
                'Content-Type': 'application/json'
            },
            json={
                'version': model_id.split(':')[1],
                'input': {
                    'img': data_uri,
                    'version': 'v1.4',
                    'scale': 2
                }
            },
            timeout=10
        )
        
        if prediction_response.status_code != 201:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Failed to start prediction'}),
                'isBase64Encoded': False
            }
        
        prediction = prediction_response.json()
        prediction_id = prediction['id']
        prediction_url = prediction['urls']['get']
        
        max_attempts = 60
        attempt = 0
        
        while attempt < max_attempts:
            status_response = requests.get(
                prediction_url,
                headers={'Authorization': f'Token {api_token}'},
                timeout=5
            )
            
            if status_response.status_code != 200:
                break
            
            result = status_response.json()
            status = result.get('status')
            
            if status == 'succeeded':
                output_url = result.get('output')
                
                if output_url:
                    image_response = requests.get(output_url, timeout=30)
                    if image_response.status_code == 200:
                        processed_base64 = base64.b64encode(image_response.content).decode('utf-8')
                        
                        return {
                            'statusCode': 200,
                            'headers': {
                                'Content-Type': 'application/json',
                                'Access-Control-Allow-Origin': '*'
                            },
                            'body': json.dumps({
                                'success': True,
                                'processedImage': processed_base64,
                                'processType': process_type,
                                'filterType': filter_type
                            }),
                            'isBase64Encoded': False
                        }
                break
            
            elif status == 'failed':
                return {
                    'statusCode': 500,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Processing failed'}),
                    'isBase64Encoded': False
                }
            
            attempt += 1
            import time
            time.sleep(2)
        
        return {
            'statusCode': 408,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Processing timeout'}),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
