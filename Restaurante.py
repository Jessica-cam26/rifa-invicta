import random
import time

def ejecutar_rifa():
    participantes = []
    
    print("--- ⌚ SORTEO DEL RELOJ ⌚ ---")
    print("Introduce los nombres de los participantes (escribe 'listo' para terminar):")

    while True:
        nombre = input("> ").strip()
        if nombre.lower() == 'listo':
            break
        if nombre:
            participantes.append(nombre)
        else:
            print("Por favor, ingresa un nombre válido.")

    if len(participantes) < 2:
        print("\n¡Error! Necesitas al menos 2 participantes para realizar el sorteo.")
        return

    print(f"\n✅ Total de participantes: {len(participantes)}")
    print("Generando suspenso...")
    
    # Efecto visual de carga
    for i in range(3, 0, -1):
        print(f"El ganador se anunciará en {i}...")
        time.sleep(1)

    ganador = random.choice(participantes)

    print("\n" + "*" * 30)
    print(f"🎉 ¡EL GANADOR DEL RELOJ ES: {ganador.upper()}! 🎉")
    print("*" * 30 + "\n")

if __name__ == "__main__":
    ejecutar_rifa()