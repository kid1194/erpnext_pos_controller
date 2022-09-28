# ERPNext POS Controller © 2022
# Author:  Ameen Ahmed
# Company: Level Up Marketing & Software Development Services
# Licence: Please refer to license.txt


from setuptools import setup, find_packages


with open('requirements.txt') as f:
    install_requires = f.read().strip().split('\n')


from erpnext_pos_controller import __version__ as version


setup(
    name='erpnext_pos_controller',
    version=version,
    description='ERPNext plugin that helps in adding some restrictions over default POS.',
    author='Ameen Ahmed (Level Up)',
    author_email='kid1194@gmail.com',
    packages=find_packages(),
    zip_safe=False,
    include_package_data=True,
    install_requires=install_requires
)